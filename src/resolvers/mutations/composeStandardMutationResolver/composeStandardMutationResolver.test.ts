import { MongoServerError } from 'mongodb';

import type { TangibleEntityConfig } from '@/tsTypes';
import type { ResolverAttributes } from '@/resolvers/tsTypes';

import sleep from '@/utils/sleep';
import executeBulkItems from '../executeBulkItems';
import composeStandardMutationResolver from './index';

jest.mock('@/utils/sleep', () => ({ __esModule: true, default: jest.fn(() => Promise.resolve()) }));

jest.mock('../executeBulkItems', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('../unwindCore', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('../incCounters', () => ({ __esModule: true, default: jest.fn(async (core) => core) }));

const exampleConfig: TangibleEntityConfig = {
  name: 'Example',
  type: 'tangible',
  textFields: [{ name: 'name', type: 'textFields' }],
};

const generalConfig = { allEntityConfigs: { Example: exampleConfig } };

const getPrevious = jest.fn(async () => [{ _id: 'new-id', name: 'Name' }]);

const resolverAttributes: ResolverAttributes = {
  actionGeneralName: 'createEntity',
  array: false,
  getPrevious,
  prepareBulkData: async ({ entityConfig }, resolverArg, preparedData) => {
    const { core, periphery, mains } = preparedData;

    core.set(entityConfig, [{ insertOne: { document: { _id: 'new-id', name: 'Name' } } }]);

    return { core, periphery, mains };
  },
  report: async () => null,
  finalResult: () => 'final result',
} as any;

const createSession = () => ({
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(async () => {}),
  abortTransaction: jest.fn(async () => {}),
  endSession: jest.fn(async () => {}),
});

const info = { projection: { name: 1 }, fieldArgs: {}, path: [] };

const resolverOptions = { involvedFilters: { inputOutputEntity: [[]] } };

const transientError = () =>
  new MongoServerError({
    message: 'Write conflict during plan execution',
    code: 112,
    codeName: 'WriteConflict',
    errorLabels: ['TransientTransactionError'],
  });

const executeBulkItemsMock = executeBulkItems as jest.Mock;
const sleepMock = sleep as jest.Mock;

const createResolver = (transactions: boolean) =>
  composeStandardMutationResolver(resolverAttributes)(
    exampleConfig,
    generalConfig,
    { transactions },
    true,
  );

describe('composeStandardMutationResolver', () => {
  beforeEach(() => {
    executeBulkItemsMock.mockReset();
    sleepMock.mockClear();
    getPrevious.mockClear();
  });

  test('should throw not transient error as is without retries', async () => {
    const error = new TypeError('Validation failed!');
    executeBulkItemsMock.mockRejectedValue(error);

    const sessions = [createSession()];
    const mongooseConn = { startSession: jest.fn(async () => sessions[0]) };

    await expect(
      createResolver(true)(null, { data: {} }, { mongooseConn }, info, resolverOptions),
    ).rejects.toBe(error);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).not.toHaveBeenCalled();
    expect(sessions[0].abortTransaction).toHaveBeenCalledTimes(1);
    expect(sessions[0].endSession).toHaveBeenCalledTimes(1);
  });

  test('should retry transient transaction error', async () => {
    executeBulkItemsMock.mockRejectedValueOnce(transientError()).mockResolvedValueOnce(undefined);

    const sessions = [createSession(), createSession()];
    let sessionIndex = 0;
    const mongooseConn = {
      startSession: jest.fn(async () => {
        sessionIndex += 1;
        return sessions[sessionIndex - 1];
      }),
    };

    const result = await createResolver(true)(
      null,
      { data: {} },
      { mongooseConn },
      info,
      resolverOptions,
    );

    expect(result).toBe('final result');
    expect(executeBulkItemsMock).toHaveBeenCalledTimes(2);
    expect(getPrevious).toHaveBeenCalledTimes(2);
    expect(sleepMock).toHaveBeenCalledTimes(1);
    expect(sessions[0].abortTransaction).toHaveBeenCalledTimes(1);
    expect(sessions[1].commitTransaction).toHaveBeenCalledTimes(1);
  });

  test('should not retry without transactions even transient error', async () => {
    const error = transientError();
    executeBulkItemsMock.mockRejectedValue(error);

    await expect(
      createResolver(false)(null, { data: {} }, { mongooseConn: {} }, info, resolverOptions),
    ).rejects.toBe(error);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).not.toHaveBeenCalled();
  });

  test('should retry only "commitTransaction" with unknown commit result', async () => {
    executeBulkItemsMock.mockResolvedValue(undefined);

    const session = createSession();
    const unknownCommitResult = new MongoServerError({
      message: 'Connection lost',
      errorLabels: ['UnknownTransactionCommitResult'],
    });
    session.commitTransaction
      .mockRejectedValueOnce(unknownCommitResult)
      .mockResolvedValueOnce(undefined);

    const mongooseConn = { startSession: jest.fn(async () => session) };

    const result = await createResolver(true)(
      null,
      { data: {} },
      { mongooseConn },
      info,
      resolverOptions,
    );

    expect(result).toBe('final result');
    expect(executeBulkItemsMock).toHaveBeenCalledTimes(1);
    expect(session.commitTransaction).toHaveBeenCalledTimes(2);
  });
});
