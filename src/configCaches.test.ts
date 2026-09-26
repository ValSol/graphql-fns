import type { GeneralConfig, SimplifiedEntityConfig } from './tsTypes';

import composeTypeDefsAndResolvers from './composeTypeDefsAndResolvers';
import resolverDecorator from './resolvers/utils/resolverDecorator';
import toGlobalId from './resolvers/utils/toGlobalId';
import { queryAttributes } from './types/actionAttributes';
import composeAllEntityConfigs from './utils/composeAllEntityConfigs';

// caches are used only outside of jest environment, so switch them on
const withCaches = (func: () => void | Promise<void>) => async () => {
  const savedJestWorkerId = process.env.JEST_WORKER_ID;
  delete process.env.JEST_WORKER_ID;

  try {
    await func();
  } finally {
    process.env.JEST_WORKER_ID = savedJestWorkerId;
  }
};

describe('caches are bound to configs (B8)', () => {
  test(
    'should compose resolvers for every generalConfig',
    withCaches(() => {
      const generalConfig1 = {
        allEntityConfigs: composeAllEntityConfigs([{ name: 'Alpha', textFields: [{ name: 'x' }] }]),
      };
      const generalConfig2 = {
        allEntityConfigs: composeAllEntityConfigs([{ name: 'Beta', textFields: [{ name: 'x' }] }]),
      };

      const { resolvers: resolvers1 } = composeTypeDefsAndResolvers(generalConfig1);
      const { resolvers: resolvers2 } = composeTypeDefsAndResolvers(generalConfig2);

      expect(resolvers1.Query.Alpha).toBeDefined();
      expect(resolvers1.Query.Beta).toBeUndefined();

      expect(resolvers2.Query.Beta).toBeDefined();
      expect(resolvers2.Query.Alpha).toBeUndefined();

      // the same config gives cached resolvers
      expect(composeTypeDefsAndResolvers(generalConfig1).resolvers).toBe(resolvers1);
    }),
  );

  test(
    'should compose representation types for every generalConfig with the same entity names',
    withCaches(() => {
      const composeGeneralConfig = (includeFields: string[]): GeneralConfig => ({
        allEntityConfigs: composeAllEntityConfigs([
          { name: 'Example', textFields: [{ name: 'textField' }, { name: 'textField2' }] },
        ]),
        representation: {
          ForView: {
            representationKey: 'ForView',
            allow: { Example: ['entities'] },
            includeFields: { Example: includeFields },
          },
        },
      });

      const { typeDefs: typeDefs1 } = composeTypeDefsAndResolvers(
        composeGeneralConfig(['textField']),
      );
      const { typeDefs: typeDefs2 } = composeTypeDefsAndResolvers(
        composeGeneralConfig(['textField2']),
      );

      const exampleForView1 = typeDefs1.match(/type ExampleForView implements[^}]*\}/)?.[0];
      const exampleForView2 = typeDefs2.match(/type ExampleForView implements[^}]*\}/)?.[0];

      expect(exampleForView1).toMatch(/\n  textField: String\n/);
      expect(exampleForView1).not.toMatch(/textField2/);

      expect(exampleForView2).toMatch(/\n  textField2: String\n/);
      expect(exampleForView2).not.toMatch(/\n  textField: String\n/);
    }),
  );

  test(
    'should transform args with config of the entity of the resolver',
    withCaches(async () => {
      const simplifiedEntityConfigs: SimplifiedEntityConfig[] = [
        { name: 'User', textFields: [{ name: 'name' }] },
        { name: 'Place', textFields: [{ name: 'title' }] },
        {
          name: 'Post',
          textFields: [{ name: 'title' }],
          relationalFields: [
            { name: 'author', oppositeName: 'posts', configName: 'User', index: true },
          ],
        },
      ];

      const allEntityConfigs = composeAllEntityConfigs(simplifiedEntityConfigs);
      const generalConfig = { allEntityConfigs };
      const serversideConfig = {};

      const func = async (parent, args) => args;

      const decorate = (entityName: string) =>
        resolverDecorator(
          func,
          ['Query', 'entities', entityName],
          queryAttributes.entities,
          allEntityConfigs[entityName],
          generalConfig,
          serversideConfig,
        );

      const userId = '5f1f1f1f1f1f1f1f1f1f1f1f';

      // "Place" resolver is called first so its transformers were cached before
      await decorate('Place')(null, { where: { title: 'x' } }, {}, {});

      const { where } = await decorate('Post')(
        null,
        { where: { author: toGlobalId(userId, 'User') } },
        {},
        {},
      );

      expect(where).toEqual({ author: userId });
    }),
  );
});
