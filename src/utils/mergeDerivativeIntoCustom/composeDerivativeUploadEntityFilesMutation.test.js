// @flow
/* eslint-env jest */
import type { DerivativeAttributes, GeneralConfig, EntityConfig } from '../../flowTypes';

import uploadEntityFilesMutationAttributes from '../../types/actionAttributes/uploadEntityFilesMutationAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';
import composeActionSignature from '../../types/composeActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDerivativeUploadEntityFilesMutation', () => {
  const imageConfig: EntityConfig = {
    name: 'RootImage',
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

  const ForCatalog: DerivativeAttributes = {
    allow: { RootImage: ['uploadEntityFiles'] },
    suffix: 'ForCatalog',
    Example: {
      floatFields: [{ name: 'floatField' }],
    },
  };

  const derivative = { ForCatalog };

  const generalConfig: GeneralConfig = {
    entityConfigs: { Example: imageConfig },
    derivative,
  };

  test('should return correct derivative config', () => {
    const result = composeCustomAction(ForCatalog, uploadEntityFilesMutationAttributes);

    const expectedResult = {
      name: 'uploadEntityFilesForCatalog',
      specificName: ({ name }) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('uploadEntityFiles')
          ? `upload${name}FilesForCatalog`
          : '',
      argNames: () => ['files', 'hashes'],
      argTypes: () => ['[Upload!]!', '[String!]!'],
      type: ({ name }) => `[${name}ForCatalog!]!`,
      config: (entityConfig2, generalConfig2) =>
        composeDerivativeConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeActionSignature(result, imageConfig, generalConfig);

    const expectedResult2 = composeActionSignature(expectedResult, imageConfig, generalConfig);

    expect(result2).toEqual(expectedResult2);
  });
});
