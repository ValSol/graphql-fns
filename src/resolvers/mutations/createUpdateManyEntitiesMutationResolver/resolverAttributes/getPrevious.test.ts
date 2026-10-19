import { Types } from 'mongoose';

import type { TangibleEntityConfig } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import checkData from '@/resolvers/mutations/checkData';
import getPrevious from './getPrevious';

jest.mock('@/mongooseModels/createMongooseModel', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('@/resolvers/mutations/checkData', () => ({
  __esModule: true,
  default: jest.fn(async () => true),
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

const composeResolverArg = (whereOneAndData: any[], filter: any = [[]]) =>
  ({
    parent: null,
    args: { whereOneAndData },
    context: { mongooseConn: {} },
    info: null,
    resolverOptions: { involvedFilters: { inputOutputFilterAndLimit: filter } },
  }) as any;

const id1 = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa65');
const id2 = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa66');

const ann = { _id: id1, email: 'ann@b.c' };
const bob = { _id: id2, email: 'bob@b.c' };

// entities are matched with items in memory, so the mock returns all of them
const find = jest.fn(async (...args: any[]) => [bob, ann]);

const checkDataMock = checkData as jest.Mock;

beforeEach(() => {
  find.mockClear();
  checkDataMock.mockClear();
  (createMongooseModel as jest.Mock).mockResolvedValue({ find });
});

describe('updateManyEntities getPrevious', () => {
  test('should get entities selected by different keys by one query in the order of items', async () => {
    const resolverArg = composeResolverArg(
      [
        { whereOne: { email: 'bob@b.c' }, data: { name: 'Bob' } },
        { whereOne: { id: id1.toString() }, data: { name: 'Ann' } },
      ],
      [[{ owner: 'user1' }]],
    );

    const result = await getPrevious(
      'updateManyEntities',
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(result).toEqual([bob, ann]);
    expect(find).toHaveBeenCalledTimes(1);
    expect(find.mock.calls[0][0]).toEqual({
      $and: [
        { $or: [{ email: { $eq: 'bob@b.c' } }, { _id: { $eq: id1 } }] },
        { owner: { $eq: 'user1' } },
      ],
    });
    expect(find.mock.calls[0][2]).toEqual({ lean: true, session });
    expect(checkDataMock).toHaveBeenCalledTimes(2);
  });

  test('should return "null" if any entity is not found', async () => {
    const resolverArg = composeResolverArg([
      { whereOne: { email: 'ann@b.c' }, data: {} },
      { whereOne: { email: 'new@b.c' }, data: {} },
    ]);

    expect(
      await getPrevious('updateManyEntities', resolverCreatorArg, resolverArg, session),
    ).toBeNull();
  });

  test('should throw if the same entity is selected by several items', async () => {
    const resolverArg = composeResolverArg([
      { whereOne: { id: id1.toString() }, data: { name: 'Ann' } },
      { whereOne: { email: 'bob@b.c' }, data: {} },
      { whereOne: { email: 'ann@b.c' }, data: { name: 'Other' } },
    ]);

    await expect(
      getPrevious('updateManyEntities', resolverCreatorArg, resolverArg, session),
    ).rejects.toThrow('Got the same "Person" entity in items 0 & 2 of "whereOneAndData"!');
  });

  test('should throw on "whereOne" item without exactly one key', async () => {
    const resolverArg = composeResolverArg([
      { whereOne: { id: id1.toString(), email: 'ann@b.c' }, data: {} },
    ]);

    await expect(
      getPrevious('updateManyEntities', resolverCreatorArg, resolverArg, session),
    ).rejects.toThrow('Expected exactly one key in whereOne item');

    expect(find).not.toHaveBeenCalled();
  });

  test('should return "null" if update is not allowed', async () => {
    checkDataMock.mockResolvedValueOnce(false);

    const resolverArg = composeResolverArg([{ whereOne: { email: 'ann@b.c' }, data: {} }]);

    expect(
      await getPrevious('updateManyEntities', resolverCreatorArg, resolverArg, session),
    ).toBeNull();
    expect(find).not.toHaveBeenCalled();
  });

  test('should return "[]" for empty items & "null" without access', async () => {
    expect(
      await getPrevious('updateManyEntities', resolverCreatorArg, composeResolverArg([]), session),
    ).toEqual([]);

    expect(
      await getPrevious(
        'updateManyEntities',
        resolverCreatorArg,
        composeResolverArg([{ whereOne: { email: 'ann@b.c' }, data: {} }], null),
        session,
      ),
    ).toBeNull();
  });
});
