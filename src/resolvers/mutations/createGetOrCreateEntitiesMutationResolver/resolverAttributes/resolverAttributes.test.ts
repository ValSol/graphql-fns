import type { TangibleEntityConfig } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import checkData from '@/resolvers/mutations/checkData';
import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import resolverAttributes from './index';

jest.mock('@/mongooseModels/createMongooseModel', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('@/resolvers/mutations/checkData', () => ({
  __esModule: true,
  default: jest.fn(async () => true),
}));

const entityConfig: TangibleEntityConfig = {
  name: 'Person',
  type: 'tangible',
  uniqueCompoundIndexes: [['firstName', 'lastName']],
  textFields: [
    { name: 'email', unique: true, type: 'textFields' },
    { name: 'firstName', type: 'textFields' },
    { name: 'lastName', type: 'textFields' },
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

const existing = { _id: 'existing-id', email: 'old@b.c', name: 'Old' };

// "db" of found entities by "email"
let db: Record<string, any> = {};

const findOne = jest.fn(async (where: any, ...rest: any[]) => db[where.email?.$eq] || null);

const checkDataMock = checkData as jest.Mock;

beforeEach(() => {
  db = { [existing.email]: existing };
  findOne.mockClear();
  checkDataMock.mockClear();
  (createMongooseModel as jest.Mock).mockResolvedValue({ findOne });
});

const getAndPrepare = async (resolverArg: any) => {
  const previous = await getPrevious(
    'getOrCreateEntities',
    resolverCreatorArg,
    resolverArg,
    session,
  );

  const preparedData = await prepareBulkData(
    resolverCreatorArg,
    resolverArg,
    { core: new Map(), periphery: new Map(), mains: previous as any[] },
    session,
  );

  return { previous, preparedData };
};

const insertedDocuments = (preparedData: any) =>
  Array.from(preparedData.core.values())
    .flat()
    .filter((item: any) => item.insertOne)
    .map(({ insertOne: { document } }: any) => document);

describe('getOrCreateEntities resolverAttributes', () => {
  test('should be array mutation without reports that retries on duplicate key', () => {
    expect(resolverAttributes).toMatchObject({
      actionGeneralName: 'getOrCreateEntities',
      array: true,
      produceCurrent: true,
      retryOnDuplicateKey: true,
    });

    expect(resolverAttributes.report!(resolverCreatorArg, composeResolverArg({}))).toBeNull();

    expect(resolverAttributes.finalResult!({ previous: [], current: [{ id: '1' }] })).toEqual([
      { id: '1' },
    ]);
  });
});

describe('getOrCreateEntities getPrevious', () => {
  test('should return only found entities & check creation of not found ones', async () => {
    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { email: 'new@b.c' }, data: { name: 'New' } },
        { whereOne: { email: 'old@b.c' }, data: { name: 'Other' } },
      ],
    });

    const result = await getPrevious(
      'getOrCreateEntities',
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(result).toEqual([existing]);
    expect(findOne).toHaveBeenCalledTimes(2);
    expect(findOne.mock.calls[0][2]).toEqual({ lean: true, session });
    expect(checkDataMock).toHaveBeenCalledTimes(1);

    const [resolverCreatorArg2, resolverArg2, filter, processingKind, session2] =
      checkDataMock.mock.calls[0];

    expect(resolverCreatorArg2).toBe(resolverCreatorArg);
    expect(resolverArg2.args).toEqual({ data: { email: 'new@b.c', name: 'New' } });
    expect(filter).toEqual([]);
    expect(processingKind).toBe('create');
    expect(session2).toBe(session);
  });

  test('should search with filter of user role', async () => {
    const resolverArg = composeResolverArg(
      { whereOneAndData: [{ whereOne: { email: 'a@b.c' }, data: {} }] },
      [[{ owner: 'user1' }]],
    );

    await getPrevious('getOrCreateEntities', resolverCreatorArg, resolverArg, session);

    expect(findOne.mock.calls[0][0]).toEqual({
      $and: [{ email: { $eq: 'a@b.c' } }, { owner: { $eq: 'user1' } }],
    });
  });

  test('should search by "whereCompoundOne"', async () => {
    const resolverArg = composeResolverArg({
      whereCompoundOneAndData: [
        { whereCompoundOne: { firstName: 'Ann', lastName: 'Lee' }, data: { name: 'Ann Lee' } },
      ],
    });

    const result = await getPrevious(
      'getOrCreateEntities',
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(result).toEqual([]);
    expect(findOne.mock.calls[0][0]).toEqual({
      firstName: { $eq: 'Ann' },
      lastName: { $eq: 'Lee' },
    });
    expect(checkDataMock.mock.calls[0][1].args.data).toEqual({
      firstName: 'Ann',
      lastName: 'Lee',
      name: 'Ann Lee',
    });
  });

  test('should return "null" if creation of any entity is not allowed', async () => {
    checkDataMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { email: 'a@b.c' }, data: {} },
        { whereOne: { email: 'b@b.c' }, data: {} },
      ],
    });

    const result = await getPrevious(
      'getOrCreateEntities',
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(result).toBeNull();
  });

  test('should return "null" without access', async () => {
    const resolverArg = composeResolverArg(
      { whereOneAndData: [{ whereOne: { email: 'a@b.c' }, data: {} }] },
      null,
    );

    const result = await getPrevious(
      'getOrCreateEntities',
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(result).toBeNull();
    expect(findOne).not.toHaveBeenCalled();
  });

  test('should return "[]" for empty items', async () => {
    const resolverArg = composeResolverArg({ whereOneAndData: [] });

    expect(
      await getPrevious('getOrCreateEntities', resolverCreatorArg, resolverArg, session),
    ).toEqual([]);
  });

  test('should throw if both or none of items args are got', async () => {
    await expect(
      getPrevious(
        'getOrCreateEntities',
        resolverCreatorArg,
        composeResolverArg({ whereOneAndData: [], whereCompoundOneAndData: [] }),
        session,
      ),
    ).rejects.toThrow(
      'Expected exactly one input from "whereOneAndData" && "whereCompoundOneAndData"!',
    );

    await expect(
      getPrevious('getOrCreateEntities', resolverCreatorArg, composeResolverArg({}), session),
    ).rejects.toThrow('Expected "whereCompoundOneAndData" or "whereOneAndData" input!');
  });

  test('should throw on incorrect "whereOne" before any search', async () => {
    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { email: 'a@b.c' }, data: {} },
        { whereOne: { id: '1', email: 'b@b.c' }, data: {} },
      ],
    });

    await expect(
      getPrevious('getOrCreateEntities', resolverCreatorArg, resolverArg, session),
    ).rejects.toThrow('Expected exactly one key in whereOne arg!');

    expect(findOne).not.toHaveBeenCalled();
  });

  test('should throw on "data" that conflicts with "whereOne"', async () => {
    const resolverArg = composeResolverArg({
      whereOneAndData: [{ whereOne: { email: 'a@b.c' }, data: { email: 'x@y.z' } }],
    });

    await expect(
      getPrevious('getOrCreateEntities', resolverCreatorArg, resolverArg, session),
    ).rejects.toThrow('Value of field "email" in "data" arg conflicts with "whereOne" arg');
  });
});

describe('getOrCreateEntities prepareBulkData', () => {
  test('should create not found entities & keep the order of items', async () => {
    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { email: 'new1@b.c' }, data: { name: 'New1' } },
        { whereOne: { email: 'old@b.c' }, data: { name: 'Other' } },
        { whereOne: { email: 'new2@b.c' }, data: { name: 'New2' } },
      ],
    });

    const { previous, preparedData } = await getAndPrepare(resolverArg);

    const inserted = insertedDocuments(preparedData);

    expect(inserted).toHaveLength(2);
    expect(inserted[0]).toMatchObject({ email: 'new1@b.c', name: 'New1' });
    expect(inserted[1]).toMatchObject({ email: 'new2@b.c', name: 'New2' });

    expect(preparedData.mains).toEqual([inserted[0], existing, inserted[1]]);

    // "previous" array is reused as "mains" ("workOutMutations" produces results from it)
    expect(preparedData.mains).toBe(previous);
  });

  test('should not prepare any writes if all entities are found', async () => {
    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { email: 'old@b.c' }, data: {} },
        { whereOne: { email: 'old@b.c' }, data: {} },
      ],
    });

    const { preparedData } = await getAndPrepare(resolverArg);

    expect(insertedDocuments(preparedData)).toEqual([]);
    expect(preparedData.mains).toEqual([existing, existing]);
  });

  test('should create once entity selected by several not found items', async () => {
    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { email: 'new@b.c' }, data: { name: 'First' } },
        { whereOne: { email: 'old@b.c' }, data: {} },
        { whereOne: { email: 'new@b.c' }, data: { name: 'Second' } },
      ],
    });

    const { preparedData } = await getAndPrepare(resolverArg);

    const inserted = insertedDocuments(preparedData);

    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({ email: 'new@b.c', name: 'First' });
    expect(preparedData.mains).toEqual([inserted[0], existing, inserted[0]]);
  });

  test('should create once entity selected by the same "whereCompoundOne" in other key order', async () => {
    const resolverArg = composeResolverArg({
      whereCompoundOneAndData: [
        { whereCompoundOne: { firstName: 'Ann', lastName: 'Lee' }, data: {} },
        { whereCompoundOne: { lastName: 'Lee', firstName: 'Ann' }, data: {} },
        { whereCompoundOne: { firstName: 'Ann', lastName: 'Ray' }, data: {} },
      ],
    });

    const { preparedData } = await getAndPrepare(resolverArg);

    const inserted = insertedDocuments(preparedData);

    expect(inserted).toHaveLength(2);
    expect(preparedData.mains).toEqual([inserted[0], inserted[0], inserted[1]]);
  });

  test('should create once entity selected by the same not found "id"', async () => {
    const id = '5f85d2a8ac4bc4a3c6a2fa65';

    const resolverArg = composeResolverArg({
      whereOneAndData: [
        { whereOne: { id }, data: { name: 'First' } },
        { whereOne: { id }, data: { name: 'Second' } },
      ],
    });

    const { preparedData } = await getAndPrepare(resolverArg);

    expect(insertedDocuments(preparedData)).toHaveLength(1);
    expect(preparedData.mains[1]).toBe(preparedData.mains[0]);
  });

  test('should throw if "getPrevious" was not called with the same "resolverArg"', () => {
    const resolverArg = composeResolverArg({ whereOneAndData: [] });

    expect(() =>
      prepareBulkData(
        resolverCreatorArg,
        resolverArg,
        { core: new Map(), periphery: new Map(), mains: [] },
        session,
      ),
    ).toThrow('Not got found items of "getOrCreateEntities" from "getPrevious"!');
  });
});
