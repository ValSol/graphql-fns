import { Types } from 'mongoose';

import type { TangibleEntityConfig } from '@/tsTypes';

import createMongooseModel from '@/mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import findEntities from '.';

jest.mock('@/mongooseModels/createMongooseModel', () => ({ __esModule: true, default: jest.fn() }));

// filter of the role that needs lookups (e.g. by fields of related entities)
jest.mock('@/resolvers/utils/mergeWhereAndFilter', () => ({
  __esModule: true,
  default: jest.fn(() => ({ lookups: [{ $lookup: {} }], where: { merged: true } })),
}));

const entityConfig: TangibleEntityConfig = {
  name: 'Person',
  type: 'tangible',
  textFields: [{ name: 'email', unique: true, type: 'textFields' }],
};

const resolverCreatorArg = {
  entityConfig,
  generalConfig: { allEntityConfigs: { Person: entityConfig } },
  serversideConfig: {},
} as any;

const resolverArg = {
  parent: null,
  args: {},
  context: { mongooseConn: {} },
  info: null,
  resolverOptions: {},
} as any;

const session = { id: 'session' };

const id1 = new Types.ObjectId('5f85d2a8ac4bc4a3c6a2fa65');

const ann = { _id: id1, email: 'ann@b.c' };

const exec = jest.fn();
const aggregate = jest.fn(() => ({ session: () => ({ exec }), exec }));
const find = jest.fn(async (...args: any[]) => [ann]);

beforeEach(() => {
  exec.mockReset();
  aggregate.mockClear();
  find.mockClear();
  (createMongooseModel as jest.Mock).mockResolvedValue({ aggregate, find });
});

describe('findEntities with lookups', () => {
  test('should get ids of available entities by one "aggregate" & entities by one "find"', async () => {
    exec.mockResolvedValue([{ _id: id1 }]);

    const result = await findEntities(
      [{ email: 'ann@b.c' }, { email: 'bob@b.c' }],
      [{ owner: { name: 'user1' } }],
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(mergeWhereAndFilter).toHaveBeenCalledWith(
      [{ owner: { name: 'user1' } }],
      { OR: [{ email: 'ann@b.c' }, { email: 'bob@b.c' }] },
      entityConfig,
    );

    expect(aggregate).toHaveBeenCalledTimes(1);

    const [pipeline] = aggregate.mock.calls[0] as any[];

    expect(pipeline[pipeline.length - 1]).toEqual({ $project: { _id: 1 } });

    expect(find).toHaveBeenCalledTimes(1);
    expect(find.mock.calls[0][0]).toEqual({ _id: { $in: [id1] } });
    expect(result).toEqual([ann, null]);
  });

  test('should not call "find" if no entity is available', async () => {
    exec.mockResolvedValue([]);

    const result = await findEntities(
      [{ email: 'ann@b.c' }, { email: 'bob@b.c' }],
      [{ owner: { name: 'user1' } }],
      resolverCreatorArg,
      resolverArg,
      session,
    );

    expect(result).toEqual([null, null]);
    expect(find).not.toHaveBeenCalled();
  });
});
