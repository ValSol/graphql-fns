import { Types } from 'mongoose';

import type { TangibleEntityConfig } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import findEntities from '.';

jest.mock('@/mongooseModels/createMongooseModel', () => ({ __esModule: true, default: jest.fn() }));

jest.mock('@/resolvers/utils/getProjectionFromInfo', () => {
  const actual = jest.requireActual('@/resolvers/utils/getProjectionFromInfo');

  return { __esModule: true, default: jest.fn(actual.default) };
});

const entityConfig: TangibleEntityConfig = {
  name: 'Person',
  type: 'tangible',
  uniqueCompoundIndexes: [['lastName', 'birthday']],
  textFields: [
    { name: 'email', unique: true, type: 'textFields' },
    { name: 'lastName', type: 'textFields' },
    { name: 'name', type: 'textFields' },
  ],
  dateTimeFields: [{ name: 'birthday', type: 'dateTimeFields' }],
};

const resolverCreatorArg = {
  entityConfig,
  generalConfig: { allEntityConfigs: { Person: entityConfig } },
  serversideConfig: {},
} as any;

const session = { id: 'session' };

const id1 = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa65');
const id2 = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa66');

const ann = { _id: id1, email: 'ann@b.c', name: 'Ann' };
const lee = {
  _id: id2,
  email: 'lee@b.c',
  lastName: 'Lee',
  birthday: new Date('2000-01-02T00:00:00.000Z'),
};

const find = jest.fn(async (...args: any[]) => [lee, ann]);

beforeEach(() => {
  find.mockClear();
  (getProjectionFromInfo as jest.Mock).mockClear();
  (createMongooseModel as jest.Mock).mockClear().mockResolvedValue({ find });
});

const composeResolverArg = () =>
  ({
    parent: null,
    args: {},
    context: { mongooseConn: {} },
    info: null,
    resolverOptions: {},
  }) as any;

describe('findEntities', () => {
  test('should get all entities by one query & match them with "wheres"', async () => {
    const result = await findEntities(
      [
        { email: 'ann@b.c' },
        { email: 'new@b.c' },
        { id: id2.toString() },
        { lastName: 'Lee', birthday: '2000-01-02T00:00:00.000Z' },
        { email: 'ann@b.c' },
      ],
      [],
      resolverCreatorArg,
      composeResolverArg(),
      session,
    );

    expect(result).toEqual([ann, null, lee, lee, ann]);
    expect(find).toHaveBeenCalledTimes(1);
    expect(find.mock.calls[0][2]).toEqual({ lean: true, session });
  });

  test('should add fields of "wheres" to projection of requested fields', async () => {
    (getProjectionFromInfo as jest.Mock).mockReturnValueOnce({ name: 1 });

    await findEntities(
      [{ email: 'ann@b.c' }, { lastName: 'Lee', birthday: '2000-01-02T00:00:00.000Z' }],
      [],
      resolverCreatorArg,
      composeResolverArg(),
      session,
    );

    expect(find.mock.calls[0][1]).toEqual({ name: 1, email: 1, lastName: 1, birthday: 1 });
  });

  test('should use got projection with fields of "wheres" instead of requested fields', async () => {
    await findEntities(
      [{ email: 'ann@b.c' }, { id: id2.toString() }],
      [],
      resolverCreatorArg,
      composeResolverArg(),
      session,
      { _id: 1, friend: 1 },
    );

    expect(getProjectionFromInfo).not.toHaveBeenCalled();
    expect(find.mock.calls[0][1]).toEqual({ _id: 1, friend: 1, email: 1 });
  });

  test('should not query db without "wheres"', async () => {
    expect(await findEntities([], [], resolverCreatorArg, composeResolverArg(), session)).toEqual(
      [],
    );

    expect(createMongooseModel).not.toHaveBeenCalled();
    expect(find).not.toHaveBeenCalled();
  });
});
