/* eslint-env jest */
import type { DescendantAttributes, GeneralConfig, EntityConfig } from '../../tsTypes';

import uploadEntityFilesMutationAttributes from '../../types/actionAttributes/uploadEntityFilesMutationAttributes';
import composeDescendantConfigByName from '../composeDescendantConfigByName';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import composeCustomAction from './composeCustomAction';

describe('composeDescendantUploadEntityFilesMutation', () => {
  const imageConfig: EntityConfig = {
    name: 'TangibleImage',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'fileId',
        type: 'textFields',
      },
      {
        name: 'address',
        type: 'textFields',
      },
    ],
  };

  const ForCatalog: DescendantAttributes = {
    allow: { TangibleImage: ['uploadEntityFiles'] },
    descendantKey: 'ForCatalog',
    addFields: {
      TangibleImage: {
        floatFields: [{ name: 'floatField' }],
      },
    },
  };

  const descendant = { ForCatalog };

  const generalConfig: GeneralConfig = {
    allEntityConfigs: { Example: imageConfig },
    descendant,
  };

  test('should return correct descendant config', () => {
    const result = composeCustomAction(ForCatalog, uploadEntityFilesMutationAttributes);

    const expectedResult = {
      name: 'uploadEntityFilesForCatalog',
      specificName: ({ name }: any) =>
        ForCatalog.allow[name] && ForCatalog.allow[name].includes('uploadEntityFiles')
          ? `upload${name}FilesForCatalog`
          : '',
      argNames: () => ['files', 'hashes'],
      argTypes: () => ['[Upload!]!', '[String!]!'],
      involvedEntityNames: ({ name }: any) => ({ inputOutputEntity: `${name}ForCatalog` }),
      type: ({ name }: any) => `[${name}ForCatalog!]!`,
      config: (entityConfig2: any, generalConfig2: any) =>
        composeDescendantConfigByName('ForCatalog', entityConfig2, generalConfig2),
    };

    const result2 = composeCustomActionSignature(result, imageConfig, generalConfig);

    const expectedResult2 = composeCustomActionSignature(
      expectedResult,
      imageConfig,
      generalConfig,
    );

    expect(result2).toEqual(expectedResult2);
  });
});
