/* eslint-env jest */

import type {
  ActionSignatureMethods,
  DescendantAttributes,
  GeneralConfig,
  EntityConfig,
} from '../../tsTypes';

import parseEntityName from '.';

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

  const ForCatalog: DescendantAttributes = {
    allow: { Example: ['entity', 'entities'] },
    descendantKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const allEntityConfigs = { Example: entityConfig };
  const custom = { Mutation: { entitiesForCatalog } };
  const descendant = { ForCatalog };

  const generalConfig: GeneralConfig = { allEntityConfigs, custom, descendant };

  test('should return only root', () => {
    const result = parseEntityName('Example', generalConfig);

    const expectedResult = { root: 'Example', descendantKey: '' };

    expect(result).toEqual(expectedResult);
  });

  test('should return root & descendantKey', () => {
    const result = parseEntityName('ExampleForCatalog', generalConfig);

    const expectedResult = { root: 'Example', descendantKey: 'ForCatalog' };

    expect(result).toEqual(expectedResult);
  });
});
