// @flow
/* eslint-env jest */

import type {
  ActionSignatureMethods,
  DerivativeAttributes,
  GeneralConfig,
  EntityConfig,
} from '../../flowTypes';

import parseEntityName from './index';

describe('parseEntityName', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
      },
    ],
  };
  const entitiesForCatalog: ActionSignatureMethods = {
    name: 'loadEntity',
    specificName: ({ name }) => `load${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }) => ({ inputEntity: name }),
    type: ({ name }) => `${name}!`,
    config: (thinConfig) => thinConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['entity', 'entities'] },
    derivativeKey: 'ForCatalog',
    addFields: {
      Example: () => ({
        floatFields: [{ name: 'floatField' }],
      }),
    },
  };

  const allEntityConfigs = { Example: entityConfig };
  const custom = { Mutation: { entitiesForCatalog } };
  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = { allEntityConfigs, custom, derivative };

  test('should return only root', () => {
    const result = parseEntityName('Example', generalConfig);

    const expectedResult = { root: 'Example', derivativeKey: '' };

    expect(result).toEqual(expectedResult);
  });

  test('should return root & derivativeKey', () => {
    const result = parseEntityName('ExampleForCatalog', generalConfig);

    const expectedResult = { root: 'Example', derivativeKey: 'ForCatalog' };

    expect(result).toEqual(expectedResult);
  });
});
