// @flow
/* eslint-env jest */
import type {
  GeneralConfig,
  Inventory,
  ServersideConfig,
  ActionSignatureMethods,
  EntityConfig,
} from '../../flowTypes';

import createCustomResolver from './index';

describe('createCustomResolver', () => {
  const resultResolver = () => 'test passed!';
  const createCustomLoadEntityMutationResolver = () => resultResolver;

  const signatureMethods: ActionSignatureMethods = {
    name: 'loadEntity',
    specificName(entityConfig) {
      const { name } = entityConfig;
      return `load${name}`;
    },
    argNames() {
      return [];
    },
    argTypes() {
      return [];
    },
    involvedEntityNames: ({ name }) => ({ inputEntity: name }),
    type(entityConfig) {
      const { name } = entityConfig;
      return `[${name}!]!`;
    },
    config: (entityConfig) => entityConfig,
  };

  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const allEntityConfigs = { Example: entityConfig };
  const custom = { Mutation: { loadEntity: signatureMethods } };
  const serversideConfig: ServersideConfig = {
    Mutation: { loadEntity: createCustomLoadEntityMutationResolver },
  };

  test('should return correct results for allowed custom mutation', async () => {
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadEntity: true } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, inventory };

    const result = createCustomResolver(
      'Mutation',
      'loadEntity',
      entityConfig,
      generalConfig,
      serversideConfig,
    );
    // $FlowFixMe
    const result2 = await result(null, {}, {}); // parent, args, context
    const resultResolver2 = await resultResolver();
    expect(result2).toBe(resultResolver2);
  });

  test('should return correct results for allowed custom mutation 2', () => {
    const inventory: Inventory = { name: 'test', include: { Mutation: { createEntity: true } } };
    const generalConfig: GeneralConfig = { allEntityConfigs, custom, inventory };

    const result = createCustomResolver(
      'Mutation',
      'loadEntity',
      entityConfig,
      generalConfig,
      serversideConfig,
    );
    expect(result).toBeNull();
  });
});
