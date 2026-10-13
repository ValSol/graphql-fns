import type { TangibleEntityConfig } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import createEntityGetPrevious from '../../createCreateEntityMutationResolver/resolverAttributes/getPrevious';
import createEntityPrepareBulkData from '../../createCreateEntityMutationResolver/resolverAttributes/prepareBulkData';
import createEntityReport from '../../createCreateEntityMutationResolver/resolverAttributes/report';
import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

jest.mock('@/mongooseModels/createMongooseModel', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('../../createCreateEntityMutationResolver/resolverAttributes/getPrevious', () => ({
  __esModule: true,
  default: jest.fn(async () => []),
}));

jest.mock('../../createCreateEntityMutationResolver/resolverAttributes/prepareBulkData', () => ({
  __esModule: true,
  default: jest.fn((resolverCreatorArg, resolverArg, preparedData) => {
    preparedData.mains.push({ _id: 'new-id', ...resolverArg.args.data });

    return preparedData;
  }),
}));

jest.mock('../../createCreateEntityMutationResolver/resolverAttributes/report', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const entityConfig: TangibleEntityConfig = {
  name: 'Person',
  type: 'tangible',
  textFields: [
    { name: 'email', unique: true, type: 'textFields' },
    { name: 'name', type: 'textFields' },
    { name: 'owner', type: 'textFields' },
  ],
};

const resolverCreatorArg = {
  entityConfig,
  generalConfig: { allEntityConfigs: { Person: entityConfig } },
  serversideConfig: {},
} as any;

const session = { id: 'session' };

const composeResolverArg = (args: Record<string, any>, filter: any = [[]]) =>
  ({
    parent: null,
    args,
    context: { mongooseConn: {} },
    info: null,
    resolverOptions: { involvedFilters: { inputOutputFilterAndLimit: filter } },
  }) as any;

const findOne = jest.fn();

const createMongooseModelMock = createMongooseModel as jest.Mock;
const createEntityGetPreviousMock = createEntityGetPrevious as jest.Mock;
const createEntityPrepareBulkDataMock = createEntityPrepareBulkData as jest.Mock;
const createEntityReportMock = createEntityReport as jest.Mock;

beforeEach(() => {
  findOne.mockReset();
  createMongooseModelMock.mockReset().mockResolvedValue({ findOne });
  createEntityGetPreviousMock.mockClear();
  createEntityPrepareBulkDataMock.mockClear();
  createEntityReportMock.mockReset();
});

describe('getOrCreateEntity getPrevious', () => {
  test('should return found entity', async () => {
    const found = { _id: 'id1', email: 'a@b.c', name: 'Ann' };
    findOne.mockResolvedValue(found);

    const resolverArg = composeResolverArg({
      whereOne: { email: 'a@b.c' },
      data: { name: 'Bob' },
    });

    const result = await getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session);

    expect(result).toEqual([found]);
    expect(findOne).toHaveBeenCalledTimes(1);
    expect(findOne.mock.calls[0][0]).toEqual({ email: { $eq: 'a@b.c' } });
    expect(findOne.mock.calls[0][2]).toEqual({ lean: true, session });
    expect(createEntityGetPreviousMock).not.toHaveBeenCalled();
  });

  test('should search with filter of user role', async () => {
    findOne.mockResolvedValue(null);

    const resolverArg = composeResolverArg({ whereOne: { email: 'a@b.c' }, data: {} }, [
      [{ owner: 'user1' }],
    ]);

    await getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session);

    expect(findOne.mock.calls[0][0]).toEqual({
      $and: [{ email: { $eq: 'a@b.c' } }, { owner: { $eq: 'user1' } }],
    });
  });

  test('should check creation of entity with "data" completed by "whereOne"', async () => {
    findOne.mockResolvedValue(null);

    const resolverArg = composeResolverArg({
      whereOne: { email: 'a@b.c' },
      data: { name: 'Ann' },
      token: 'token',
    });

    const result = await getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session);

    expect(result).toEqual([]);
    expect(createEntityGetPreviousMock).toHaveBeenCalledTimes(1);

    const [actionGeneralName, resolverCreatorArg2, resolverArg2, session2] =
      createEntityGetPreviousMock.mock.calls[0];

    expect(actionGeneralName).toBe('getOrCreateEntity');
    expect(resolverCreatorArg2).toBe(resolverCreatorArg);
    expect(resolverArg2.args).toEqual({
      whereOne: { email: 'a@b.c' },
      data: { email: 'a@b.c', name: 'Ann' },
      token: 'token',
    });
    expect(resolverArg2.resolverOptions).toBe(resolverArg.resolverOptions);
    expect(session2).toBe(session);
  });

  test('should return "null" if creation is not allowed', async () => {
    findOne.mockResolvedValue(null);
    createEntityGetPreviousMock.mockResolvedValueOnce(null);

    const resolverArg = composeResolverArg({ whereOne: { email: 'a@b.c' }, data: {} });

    const result = await getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session);

    expect(result).toBeNull();
  });

  test('should return "null" without access', async () => {
    const resolverArg = composeResolverArg({ whereOne: { email: 'a@b.c' }, data: {} }, null);

    const result = await getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session);

    expect(result).toBeNull();
    expect(findOne).not.toHaveBeenCalled();
    expect(createEntityGetPreviousMock).not.toHaveBeenCalled();
  });

  test('should throw on incorrect "whereOne"', async () => {
    const resolverArg = composeResolverArg({ whereOne: { id: '1', email: 'a@b.c' }, data: {} });

    await expect(
      getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session),
    ).rejects.toThrow('Expected exactly one key in whereOne arg!');
  });

  test('should throw on "data" that conflicts with "whereOne"', async () => {
    findOne.mockResolvedValue(null);

    const resolverArg = composeResolverArg({
      whereOne: { email: 'a@b.c' },
      data: { email: 'x@y.z' },
    });

    await expect(
      getPrevious('getOrCreateEntity', resolverCreatorArg, resolverArg, session),
    ).rejects.toThrow('Value of field "email" in "data" arg conflicts with "whereOne" arg');
  });
});

describe('getOrCreateEntity prepareBulkData', () => {
  test('should not prepare any writes for found entity', async () => {
    const preparedData = { core: new Map(), periphery: new Map(), mains: [{ _id: 'id1' }] };

    const result = await prepareBulkData(
      resolverCreatorArg,
      composeResolverArg({ whereOne: { email: 'a@b.c' }, data: {} }),
      preparedData,
      session,
    );

    expect(result).toBe(preparedData);
    expect(createEntityPrepareBulkDataMock).not.toHaveBeenCalled();
  });

  test('should prepare creation with "data" completed by "whereOne"', async () => {
    const preparedData = { core: new Map(), periphery: new Map(), mains: [] };

    const result = await prepareBulkData(
      resolverCreatorArg,
      composeResolverArg({ whereOne: { email: 'a@b.c' }, data: { name: 'Ann' } }),
      preparedData,
      session,
    );

    expect(createEntityPrepareBulkDataMock).toHaveBeenCalledTimes(1);
    expect(createEntityPrepareBulkDataMock.mock.calls[0][1].args.data).toEqual({
      email: 'a@b.c',
      name: 'Ann',
    });
    expect(createEntityPrepareBulkDataMock.mock.calls[0][3]).toBe(session);
    expect(result.mains).toEqual([{ _id: 'new-id', email: 'a@b.c', name: 'Ann' }]);
  });
});

describe('getOrCreateEntity report', () => {
  const resolverArg = composeResolverArg({ whereOne: { email: 'a@b.c' }, data: {} });

  test('should report only created entity', async () => {
    const subscription = jest.fn();
    createEntityReportMock.mockResolvedValue(subscription);

    const reportFn = await report(resolverCreatorArg, resolverArg);

    reportFn({ previous: [{ _id: 'id1' }], current: [{ id: 'id1' }] });
    expect(subscription).not.toHaveBeenCalled();

    const created = { previous: [], current: [{ id: 'new-id' }] };
    reportFn(created);
    expect(subscription).toHaveBeenCalledWith(created);
  });

  test('should return "null" if subscription is not used', async () => {
    createEntityReportMock.mockResolvedValue(null);

    expect(await report(resolverCreatorArg, resolverArg)).toBeNull();
  });
});
