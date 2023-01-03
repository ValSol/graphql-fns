// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import uploadFilesToEntityMutationAttributes from '../../types/actionAttributes/uploadFilesToEntityMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeUploadFilesToEntityMutation', () => {
  const imageConfig: EntityConfig = {
    name: 'Image',
    type: 'file',
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };

  const entityConfig: EntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        array: true,
        index: true,
      },
    ],
    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
      },
    ],
  };
  const ForCatalog: DerivativeAttributes = {
    allow: { Example: ['uploadFilesToEntity'] },
    derivativeKey: 'ForCatalog',
    Example: {
      floatFields: [{ name: 'floatField' }],
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: entityConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, uploadFilesToEntityMutationAttributes);

    const expectedResult = {
      name: 'uploadFilesToEntityForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('uploadFilesToEntity')
          ? `uploadFilesTo${name}ForCatalog`
          : '',
      argNames: () => ['whereOne', 'data', 'files', 'options'],
      argTypes: ({ name }) => [
        `${name}ForCatalogWhereOneInput!`,
        `UploadFilesTo${name}ForCatalogInput`,
        '[Upload!]!',
        `FilesOf${name}ForCatalogOptionsInput!`,
      ],
      involvedEntityNames: ({ name }) => ({ mainEntity: `${name}ForCatalog` }),
      type: ({ name }) => `${name}ForCatalog!`,
      config: (entityConfig2, generalConfig2) =>
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
  });
});
