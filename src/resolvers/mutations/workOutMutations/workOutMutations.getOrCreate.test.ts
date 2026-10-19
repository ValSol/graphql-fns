import { MongoServerError } from 'mongodb';

import type { TangibleEntityConfig } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import executeBulkItems from '../executeBulkItems';
import workOutMutations from './index';

jest.mock('@/utils/sleep', () => ({ __esModule: true, default: jest.fn(() => Promise.resolve()) }));

jest.mock('@/mongooseModels/createMongooseModel', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('../executeBulkItems', () => ({ __esModule: true, default: jest.fn() }));

// real "produceResult" reads entities from db
jest.mock('../composeStandardMutationResolver/produceResult', () => ({
  __esModule: true,
  default: jest.fn(async ({ mains }) => mains),
}));

const personConfig: TangibleEntityConfig = {
  name: 'Person',
  type: 'tangible',
  textFields: [
    { name: 'email', unique: true, type: 'textFields' },
    { name: 'name', type: 'textFields' },
  ],
};

const existing = { _id: 'existing-id', email: 'old@b.c', name: 'Old' };

// "db" of found entities by "email"
let db: Record<string, any> = {};

const findOne = jest.fn(async (where) => db[where.email?.$eq] || null);

const publish = jest.fn();

const commonResolverCreatorArg = {
  generalConfig: { allEntityConfigs: { Person: personConfig } },
  serversideConfig: { transactions: true },
  context: {
    pubsub: { publish },
    mongooseConn: {
      startSession: async () => ({
        startTransaction: () => {},
        commitTransaction: async () => {},
        abortTransaction: async () => {},
        endSession: async () => {},
      }),
    },
  },
} as any;

const resolverOptions = {
  involvedFilters: { inputOutputFilterAndLimit: [[]] },
  subscriptionEntityNames: { subscriptionCreatedEntityName: 'Person' },
};

const getOrCreate = (email: string, name: string) => ({
  actionGeneralName: 'getOrCreateEntity',
  entityConfig: personConfig,
  args: { whereOne: { email }, data: { name } },
  resolverOptions,
  returnResult: true,
  returnReport: true,
});

const executeBulkItemsMock = executeBulkItems as jest.Mock;

const insertedDocuments = (callIndex = 0) =>
  Array.from(executeBulkItemsMock.mock.calls[callIndex][0].values())
    .flat()
    .filter((item: any) => item.insertOne)
    .map(({ insertOne: { document } }: any) => document);

beforeEach(() => {
  db = { [existing.email]: existing };
  findOne.mockClear();
  publish.mockClear();
  executeBulkItemsMock.mockReset();
  (createMongooseModel as jest.Mock).mockResolvedValue({ findOne });
});

describe('workOutMutations with "getOrCreateEntity"', () => {
  test('should return found entity without writes & events', async () => {
    const [result] = await workOutMutations(
      [getOrCreate('old@b.c', 'Other')] as any,
      commonResolverCreatorArg,
    );

    expect(result).toEqual(existing);
    expect(insertedDocuments()).toEqual([]);
    expect(publish).not.toHaveBeenCalled();
  });

  test('should create entity with "data" completed by "whereOne" & report it', async () => {
    const [result] = await workOutMutations(
      [getOrCreate('new@b.c', 'New')] as any,
      commonResolverCreatorArg,
    );

    const [document] = insertedDocuments();

    expect(document).toMatchObject({ email: 'new@b.c', name: 'New' });
    expect(result).toBe(document);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith('created-Person', {
      createdPerson: { actor: null, node: document },
    });
  });

  test('should get & create entities in one batch', async () => {
    const results = await workOutMutations(
      [getOrCreate('old@b.c', 'Other'), getOrCreate('new@b.c', 'New')] as any,
      commonResolverCreatorArg,
    );

    const [document] = insertedDocuments();

    expect(insertedDocuments()).toHaveLength(1);
    expect(results).toEqual([existing, document]);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  test('should keep result of "createEntity" in the same batch', async () => {
    const [created, got] = await workOutMutations(
      [
        {
          actionGeneralName: 'createEntity',
          entityConfig: personConfig,
          args: { data: { email: 'other@b.c', name: 'Other' } },
          resolverOptions,
          returnResult: true,
          returnReport: true,
        },
        getOrCreate('old@b.c', 'Old'),
      ] as any,
      commonResolverCreatorArg,
    );

    expect(created).toMatchObject({ email: 'other@b.c', name: 'Other' });
    expect(got).toEqual(existing);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish.mock.calls[0][1].createdPerson.node).toBe(created);
  });

  test('should get entity created concurrently after duplicate key error', async () => {
    const concurrent = { _id: 'concurrent-id', email: 'new@b.c', name: 'Concurrent' };

    executeBulkItemsMock.mockImplementationOnce(async () => {
      db[concurrent.email] = concurrent;

      throw new MongoServerError({ message: 'E11000 duplicate key error', code: 11000 });
    });

    const [result] = await workOutMutations(
      [getOrCreate('new@b.c', 'New')] as any,
      commonResolverCreatorArg,
    );

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(2);
    expect(insertedDocuments(1)).toEqual([]);
    expect(result).toEqual(concurrent);
    expect(publish).not.toHaveBeenCalled();
  });

  test('should throw repeated duplicate key error', async () => {
    const error = new MongoServerError({ message: 'E11000 duplicate key error', code: 11000 });

    executeBulkItemsMock.mockRejectedValue(error);

    await expect(
      workOutMutations([getOrCreate('new@b.c', 'New')] as any, commonResolverCreatorArg),
    ).rejects.toBe(error);

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(2);
  });
});

const getOrCreateMany = (items: Array<[string, string]>) => ({
  actionGeneralName: 'getOrCreateEntities',
  entityConfig: personConfig,
  args: {
    whereOneAndData: items.map(([email, name]) => ({ whereOne: { email }, data: { name } })),
  },
  resolverOptions,
  returnResult: true,
  returnReport: true,
});

describe('workOutMutations with "getOrCreateEntities"', () => {
  test('should get & create entities in the order of items without events', async () => {
    const [result] = await workOutMutations(
      [
        getOrCreateMany([
          ['new1@b.c', 'New1'],
          ['old@b.c', 'Other'],
          ['new2@b.c', 'New2'],
        ]),
      ] as any,
      commonResolverCreatorArg,
    );

    const documents = insertedDocuments();

    expect(documents).toHaveLength(2);
    expect(documents[0]).toMatchObject({ email: 'new1@b.c', name: 'New1' });
    expect(documents[1]).toMatchObject({ email: 'new2@b.c', name: 'New2' });
    expect(result).toEqual([documents[0], existing, documents[1]]);
    expect(publish).not.toHaveBeenCalled();
  });

  test('should work in one batch with "getOrCreateEntity"', async () => {
    const [many, one] = await workOutMutations(
      [getOrCreateMany([['old@b.c', 'Other']]), getOrCreate('new@b.c', 'New')] as any,
      commonResolverCreatorArg,
    );

    const [document] = insertedDocuments();

    expect(many).toEqual([existing]);
    expect(one).toBe(document);
    expect(publish).toHaveBeenCalledTimes(1);
  });

  test('should get entities created concurrently after duplicate key error', async () => {
    const concurrent = { _id: 'concurrent-id', email: 'new@b.c', name: 'Concurrent' };

    executeBulkItemsMock.mockImplementationOnce(async () => {
      db[concurrent.email] = concurrent;

      throw new MongoServerError({ message: 'E11000 duplicate key error', code: 11000 });
    });

    const [result] = await workOutMutations(
      [
        getOrCreateMany([
          ['new@b.c', 'New'],
          ['old@b.c', 'Old'],
        ]),
      ] as any,
      commonResolverCreatorArg,
    );

    expect(executeBulkItemsMock).toHaveBeenCalledTimes(2);
    expect(insertedDocuments(1)).toEqual([]);
    expect(result).toEqual([concurrent, existing]);
  });
});
