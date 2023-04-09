/* eslint-env jest */

import type {
  ActionSignatureMethods,
  DerivativeAttributes,
  GeneralConfig,
  EntityConfig,
} from '../../tsTypes';

import parseEntityName from './index';

describe('parseEntityName', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        type: 'textFields',
      },
    ],
  };
  const entitiesForCatalog: ActionSignatureMethods = {
    name: 'loadEntity',
    specificName: ({ name }: any) => `load${name}`,
    argNames: () => [],
    argTypes: () => [],
    involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: name }),
    type: ({ name }: any) => `${name}!`,
    config: (thinConfig: any) => thinConfig,
  };

  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['entity', 'entities'] },
    derivativeKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
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
