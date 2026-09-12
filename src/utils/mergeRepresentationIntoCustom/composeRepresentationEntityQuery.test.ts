/* eslint-env jest */
import type { RepresentationAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entityQueryAttributes from '../../types/actionAttributes/entityQueryAttributes';
import composeRepresentationConfigByName from '../composeRepresentationConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeRepresentationEntityQuery', () => {
  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        index: true,
        type: 'textFields',
      },
    ],
  };
  const ForCatalog: RepresentationAttributes = {
    allow: { Example: ['entity', 'entities'] },
    representationKey: 'ForCatalog',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
    involvedOutputRepresentationKeys: {
      Example: { outputEntity: 'ForView' },
    },
  };

  const ForView: RepresentationAttributes = {
    allow: { Example: [] },
    representationKey: 'ForView',
    addFields: {
      Example: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const representation = { ForCatalog, ForView };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    representation,
  };

  test('should return correct representation config', () => {
    const result = composeCustomAction(ForCatalog, entityQueryAttributes);

    const expectedResult = {
      name: 'entityForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entity')
          ? `${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'token'],
      argTypes: ({ name }: any) => [`${name}ForCatalogWhereOneInput!`, 'String'],
      involvedEntityNames: ({ name }: any) => ({
        inputEntity: `${name}ForCatalog`,
        outputEntity: `${name}ForView`,
      }),
      type: ({ name }: any) => `${name}ForView`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeRepresentationConfigByName('ForView', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, entityConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      entityConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);

    expect(result.involvedEntityNames(entityConfig, generalConfig)).toEqual(
      expectedResult.involvedEntityNames(entityConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );

    expect(result.config(entityConfig, generalConfig)).toEqual(
      expectedResult.config(entityConfig, generalConfig),
    );
  });
});
