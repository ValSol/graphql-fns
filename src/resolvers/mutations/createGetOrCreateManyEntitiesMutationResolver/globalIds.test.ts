import type { GeneralConfig, TangibleEntityConfig } from '@/tsTypes';

import getOrCreateManyEntitiesMutationAttributes from '@/types/actionAttributes/getOrCreateManyEntitiesMutationAttributes';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import resolverDecorator from '@/resolvers/utils/resolverDecorator';
import toGlobalId from '@/resolvers/utils/toGlobalId';

describe('global ids in args of "getOrCreateManyEntities"', () => {
  const allEntityConfigs = composeAllEntityConfigs([
    {
      name: 'Person',
      textFields: [{ name: 'email', unique: true }, { name: 'lastName' }],
      relationalFields: [{ name: 'friend', oppositeName: 'fellows', configName: 'Person' }],
      uniqueCompoundIndexes: [['lastName', 'friend']],
    },
  ]);

  const personConfig = allEntityConfigs.Person as TangibleEntityConfig;

  const generalConfig: GeneralConfig = { allEntityConfigs };

  const id1 = '5c9e7c6d3ab6d9b5c2a0e1f1';
  const id2 = '5c9e7c6d3ab6d9b5c2a0e1f2';

  const composeResolver = () => {
    const func = jest.fn(async () => null);

    const resolver = resolverDecorator(
      func,
      ['Mutation', 'getOrCreateManyEntities', 'Person'],
      getOrCreateManyEntitiesMutationAttributes,
      personConfig,
      generalConfig,
      {},
    );

    return { func, resolver };
  };

  test('should transform "whereOne" & "data" of "whereOneAndData" items', async () => {
    const { func, resolver } = composeResolver();

    await resolver(
      null,
      {
        whereOneAndData: [
          {
            whereOne: { id: toGlobalId(id1, 'Person') },
            data: { friend: { connect: toGlobalId(id2, 'Person') } },
          },
        ],
      },
      {},
      null,
    );

    expect(func).toHaveBeenCalledTimes(1);

    const [, args] = func.mock.calls[0] as any[];

    expect(args).toEqual({
      whereOneAndData: [{ whereOne: { id: id1 }, data: { friend: { connect: id2 } } }],
    });
  });

  test('should transform "whereCompoundOne" & "data" of "whereCompoundOneAndData" items', async () => {
    const { func, resolver } = composeResolver();

    await resolver(
      null,
      {
        whereCompoundOneAndData: [
          {
            whereCompoundOne: { lastName: 'Lee', friend: toGlobalId(id1, 'Person') },
            data: { email: 'a@b.c' },
          },
        ],
      },
      {},
      null,
    );

    const [, args] = func.mock.calls[0] as any[];

    expect(args).toEqual({
      whereCompoundOneAndData: [
        { whereCompoundOne: { lastName: 'Lee', friend: id1 }, data: { email: 'a@b.c' } },
      ],
    });
  });
});
