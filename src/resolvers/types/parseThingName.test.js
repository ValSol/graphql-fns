// @flow
/* eslint-env jest */

import type {
  ActionSignatureMethods,
  DerivativeAttributes,
  GeneralConfig,
  ThingConfig,
} from '../../flowTypes';

import parseThingName from './parseThingName';

describe('parseThingName', () => {
  const thingConfig: ThingConfig = {
    name: 'Example',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };
  const thingsForCatalog: ActionSignatureMethods = {
    name: ({ name }) => `load${name}`,
    argNames: () => [],
    argTypes: () => [],
    type: ({ name }) => `${name}!`,
    config: (thinConfig) => thinConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    allowedRootNames: ['Example'],
    suffix: 'ForCatalog',
    config: (config) => config,
  };

  const thingConfigs = { Example: thingConfig };
  const custom = { Mutation: { thingsForCatalog } };
  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = { thingConfigs, custom, derivative };

  test('should return only root', () => {
    const result = parseThingName('Example', generalConfig);

    const expectedResult = { root: 'Example', suffix: '' };

    expect(result).toEqual(expectedResult);
  });

  test('should return root & suffix', () => {
    const result = parseThingName('ExampleForCatalog', generalConfig);

    const expectedResult = { root: 'Example', suffix: 'ForCatalog' };

    expect(result).toEqual(expectedResult);
  });
});
