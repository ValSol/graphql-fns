/* eslint-env jest */

import { MongoServerError } from 'mongodb';

import type { TangibleEntityConfig } from '@/tsTypes';
import type { PreparedData } from '@/resolvers/tsTypes';

import sleep from '@/utils/sleep';
import executeBulkItems from '../executeBulkItems';
import workOutMutations from './index';

jest.mock('@/utils/sleep', () => ({ __esModule: true, default: jest.fn(() => Promise.resolve()) }));

jest.mock('../executeBulkItems', () => ({ __esModule: true, default: jest.fn() }));

// mimics real "addPeripheryToCore" that "unshift"s items into arrays of "core"
jest.mock('../addPeripheryToCore', () => ({
  __esModule: true,
  default: jest.fn(async (periphery, core) => {
    periphery.forEach((obj, config) => {
      Object.keys(obj).forEach((oppositeName) => {
        const { name, oppositeIds } = obj[oppositeName];
        const bulkItems = oppositeIds.map((id) => ({
          updateOne: { filter: { _id: id }, update: { $unset: { [name]: 1 } } },
        }));

        const coreItem = core.get(config);
        if (coreItem) {
          coreItem.unshift(...bulkItems);
        } else {
          core.set(config, bulkItems);
        }
      });
    });

    return core;
  }),
}));

// mimics real "prepareBulkData" (see "processCreateInputData") that pushes into containers it gets
jest.mock('./mutationsResolverAttributes', () => ({
  __esModule: true,
  default: {
    createEntity: {
      array: false,
      getPrevious: async () => [{ _id: 'new-id', name: 'Name' }],
      prepareBulkData: async ({ entityConfig }, resolverArg, preparedData) => {
        const { core, periphery, mains } = preparedData;

        const item = { insertOne: { document: { _id: 'new-id', name: 'Name' } } };
        const coreItem = core.get(entityConfig);
        if (coreItem) {
          coreItem.push(item);
        } else {
          core.set(entityConfig, [item]);
        }

        const peripheryItem = periphery.get(entityConfig);
        if (peripheryItem) {
          peripheryItem.parent.oppositeIds.push('opposite-id');
        } else {
          periphery.set(entityConfig, {
            parent: {
              array: false,
              name: 'name',
              oppositeConfig: entityConfig,
              oppositeIds: ['opposite-id'],
            },
          });
        }

        return { core, periphery, mains };
      },
      finalResult: (result) => result,
    },
  },
}));

const exampleConfig: TangibleEntityConfig = {
  name: 'Example',
  type: 'tangible',
  textFields: [{ name: 'name', type: 'textFields' }],
};

const standardMutationsArgs = [
  {
    actionGeneralName: 'createEntity',
    entityConfig: exampleConfig,
    args: { data: { name: 'Name' } },
  },
];

const commonResolverCreatorArg = {
  generalConfig: { allEntityConfigs: { Example: exampleConfig } },
  serversideConfig: { transactions: false },
  context: { mongooseConn: {} },
} as any;

const executeBulkItemsMock = executeBulkItems as jest.Mock;
const sleepMock = sleep as jest.Mock;

const calls: Array<Array<[string, any[]]>> = [];

const recordCall = (core) => {
  calls.push(
    Array.from(core.entries(), ([{ name }, bulkItems]) => [
      name,
      JSON.parse(JSON.stringify(bulkItems)),
    ]),
  );
};

const transientError = () =>
  new MongoServerError({
    message: 'Write conflict during plan execution',
    code: 112,
    codeName: 'WriteConflict',
    errorLabels: ['TransientTransactionError'],
  });

beforeEach(() => {
  calls.length = 0;
  executeBulkItemsMock.mockReset();
  sleepMock.mockClear();
});

describe('workOutMutations retries', () => {
  test('should give every attempt the same bulk items after transient error', async () => {
    executeBulkItemsMock
      .mockImplementationOnce(async (core) => {
        recordCall(core);
        throw transientError();
      })
      .mockImplementationOnce(async (core) => {
        recordCall(core);
        return [];
      });

    await workOutMutations(standardMutationsArgs as any, commonResolverCreatorArg);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(2);
    expect(calls[0]).toEqual([
      [
        'Example',
        [
          { updateOne: { filter: { _id: 'opposite-id' }, update: { $unset: { name: 1 } } } },
          { insertOne: { document: { _id: 'new-id', name: 'Name' } } },
        ],
      ],
    ]);
    expect(calls[1]).toEqual(calls[0]);
    expect(sleepMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).toHaveBeenCalledWith(100);
  });

  test('should honour caller-provided preparedBulkData without mutating it', async () => {
    const preparedBulkData: PreparedData = {
      core: new Map([[exampleConfig, [{ insertOne: { document: { _id: 'pre-id' } } }]]]),
      periphery: new Map(),
      mains: [],
    };

    executeBulkItemsMock
      .mockImplementationOnce(async (core) => {
        recordCall(core);
        throw transientError();
      })
      .mockImplementationOnce(async (core) => {
        recordCall(core);
        return [];
      });

    await workOutMutations(
      standardMutationsArgs as any,
      commonResolverCreatorArg,
      preparedBulkData,
    );

    expect(calls[0][0][1]).toEqual([
      { updateOne: { filter: { _id: 'opposite-id' }, update: { $unset: { name: 1 } } } },
      { insertOne: { document: { _id: 'pre-id' } } },
      { insertOne: { document: { _id: 'new-id', name: 'Name' } } },
    ]);
    expect(calls[1]).toEqual(calls[0]);

    expect(preparedBulkData.core.get(exampleConfig)).toEqual([
      { insertOne: { document: { _id: 'pre-id' } } },
    ]);
    expect(preparedBulkData.periphery.size).toBe(0);
  });

  test('should throw non-transient mongo error from the first attempt without backoff', async () => {
    const duplicateKeyError = new MongoServerError({
      message: 'E11000 duplicate key error collection: db.example_things index: original_1',
      code: 11000,
    });

    executeBulkItemsMock.mockRejectedValue(duplicateKeyError);

    await expect(
      workOutMutations(standardMutationsArgs as any, commonResolverCreatorArg),
    ).rejects.toBe(duplicateKeyError);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).not.toHaveBeenCalled();
  });

  test('should throw TypeError from the first attempt without backoff', async () => {
    const typeError = new TypeError('Wrong unset fields');

    executeBulkItemsMock.mockRejectedValue(typeError);

    await expect(
      workOutMutations(standardMutationsArgs as any, commonResolverCreatorArg),
    ).rejects.toBe(typeError);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).not.toHaveBeenCalled();
  });

  test('should throw original transient error after all attempts', async () => {
    const error = transientError();

    executeBulkItemsMock.mockRejectedValue(error);

    await expect(
      workOutMutations(standardMutationsArgs as any, commonResolverCreatorArg),
    ).rejects.toBe(error);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(7);
    expect(sleepMock).toHaveBeenCalledTimes(6);
  });
});

describe('workOutMutations commit retries', () => {
  const session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const commonResolverCreatorArgWithTransactions = {
    ...commonResolverCreatorArg,
    serversideConfig: { transactions: true },
    context: { mongooseConn: { startSession: async () => session } },
  } as any;

  const unknownCommitResultError = () =>
    new MongoServerError({
      message: 'Commit result is unknown',
      code: 50,
      codeName: 'MaxTimeMSExpired',
      errorLabels: ['UnknownTransactionCommitResult'],
    });

  beforeEach(() => {
    Object.values(session).forEach((fn) => fn.mockReset());
    executeBulkItemsMock.mockImplementation(async (core) => {
      recordCall(core);
      return [];
    });
  });

  test('should retry only commit after UnknownTransactionCommitResult', async () => {
    session.commitTransaction.mockRejectedValueOnce(unknownCommitResultError());

    await workOutMutations(standardMutationsArgs as any, commonResolverCreatorArgWithTransactions);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(session.startTransaction).toHaveBeenCalledTimes(1);
    expect(session.commitTransaction).toHaveBeenCalledTimes(2);
    expect(session.abortTransaction).not.toHaveBeenCalled();
    expect(sleepMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).toHaveBeenCalledWith(100);
  });

  test('should throw original error when commit result stays unknown', async () => {
    const error = unknownCommitResultError();
    session.commitTransaction.mockRejectedValue(error);

    await expect(
      workOutMutations(standardMutationsArgs as any, commonResolverCreatorArgWithTransactions),
    ).rejects.toBe(error);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(session.commitTransaction).toHaveBeenCalledTimes(7);
    expect(session.abortTransaction).not.toHaveBeenCalled();
  });

  test('should retry whole transaction when commit fails with TransientTransactionError', async () => {
    session.commitTransaction.mockRejectedValueOnce(transientError());

    await workOutMutations(standardMutationsArgs as any, commonResolverCreatorArgWithTransactions);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(2);
    expect(calls[1]).toEqual(calls[0]);
    expect(session.startTransaction).toHaveBeenCalledTimes(2);
    expect(session.commitTransaction).toHaveBeenCalledTimes(2);
  });
});
