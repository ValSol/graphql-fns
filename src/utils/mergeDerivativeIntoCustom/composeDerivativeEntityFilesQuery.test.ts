/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import entityFilesQueryAttributes from '../../types/actionAttributes/entityFilesQueryAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeEntityFilesQuery', () => {
  const entityConfig: EntityConfig = {
    name: 'TangiblePhoto',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'textField',
        index: true,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { TangiblePhoto: ['entityFiles'] },
    derivativeKey: 'ForCatalog',
    addFields: {
      TangiblePhoto: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { TangiblePhoto: entityConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, entityFilesQueryAttributes);

    const expectedResult = {
      name: 'entityFilesForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('entityFiles')
          ? `${name}FilesForCatalog`
          : '',
      argNames: () => ['where'],
      argTypes: () => ['FileWhereInput'],
      involvedEntityNames: ({ name }: any) => ({
        inputOutputEntity: `${name}ForCatalog`,
      }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
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
  });
});
