/* eslint-env jest */

import type {
  ActionSignatureMethods,
  RepresentationAttributes,
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

  const ForCatalog: RepresentationAttributes = {
    allow: { Example: ['entity', 'entities'] },
    representationKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const allEntityConfigs = { Example: entityConfig };
  const custom = { Mutation: { entitiesForCatalog } };
  const representation = { ForCatalog };

  const generalConfig: GeneralConfig = { allEntityConfigs, custom, representation };

  test('should return only root', () => {
    const result = parseEntityName('Example', generalConfig);

    const expectedResult = { root: 'Example', representationKey: '' };

    expect(result).toEqual(expectedResult);
  });

  test('should return root & representationKey', () => {
    const result = parseEntityName('ExampleForCatalog', generalConfig);

    const expectedResult = { root: 'Example', representationKey: 'ForCatalog' };

    expect(result).toEqual(expectedResult);
  });
});
