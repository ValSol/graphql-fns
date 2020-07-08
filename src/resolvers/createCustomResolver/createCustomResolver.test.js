// @flow
/* eslint-env jest */
import type {
  GeneralConfig,
  Inventory,
  ServersideConfig,
  ActionSignatureMethods,
  ThingConfig,
} from '../../flowTypes';

import createCustomResolver from './index';

describe('createCustomResolver', () => {
  const resultResolver = () => 'test passed!';
  const createCustomLoadThingMutationResolver = () => resultResolver;

  const signatureMethods: ActionSignatureMethods = {
    name: 'loadThing',
    specificName(thingConfig) {
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
    config: (thingConfig) => thingConfig,
  };

  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };

  const thingConfigs = { Example: thingConfig };
  const custom = { Mutation: { loadThing: signatureMethods } };
  const serversideConfig: ServersideConfig = {
    Mutation: { loadThing: createCustomLoadThingMutationResolver },
  };

  test('should return correct results for allowed custom mutation', async () => {
    const inventory: Inventory = { name: 'test', include: { Mutation: { loadThing: true } } };
    const generalConfig: GeneralConfig = { thingConfigs, custom, inventory };

    const result = createCustomResolver(
      'Mutation',
      'loadThing',
      thingConfig,
      generalConfig,
      serversideConfig,
    );
    // $FlowFixMe
    const result2 = await result();
    const resultResolver2 = await resultResolver();
    expect(result2).toBe(resultResolver2);
  });

  test('should return correct results for allowed custom mutation 2', () => {
    const inventory: Inventory = { name: 'test', include: { Mutation: { createThing: true } } };
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
