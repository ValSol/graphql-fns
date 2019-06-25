// @flow
/* eslint-env jest */
import type {
  GeneralConfig,
  Inventory,
  ServersideConfig,
  SignatureMethods,
  ThingConfig,
} from '../flowTypes';

import createCustomResolver from './createCustomResolver';

describe('createCustomResolver', () => {
  const resultResolver = () => 'test passed!';
  const createCustomLoadThingMutationResolver = () => resultResolver;

  const signatureMethods: SignatureMethods = {
    name(thingConfig) {
      const { name } = thingConfig;
      return `load${name}`;
    },
    argNames() {
      return [];
    },
    argTypes() {
      return [];
    },
    type(thingConfig) {
      const { name } = thingConfig;
      return `[${name}!]!`;
    },
  };

  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const thingConfigs = [thingConfig];
  const custom = { Mutation: { loadThing: signatureMethods } };
  const serversideConfig: ServersideConfig = {
    Mutation: { loadThing: createCustomLoadThingMutationResolver },
  };

  test('should return correct results for allowed custom mutation', () => {
    const inventory: Inventory = { include: { Mutation: { loadThing: null } } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };

    const result = createCustomResolver(
      'Mutation',
      'loadThing',
      thingConfig,
      generalConfig,
      serversideConfig,
    );
    expect(result).toBe(resultResolver);
  });

  test('should return correct results for allowed custom mutation', () => {
    const inventory: Inventory = { include: { Mutation: { createThing: null } } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };

    const result = createCustomResolver(
      'Mutation',
      'loadThing',
      thingConfig,
      generalConfig,
      serversideConfig,
    );
    expect(result).toBeNull();
  });
});
