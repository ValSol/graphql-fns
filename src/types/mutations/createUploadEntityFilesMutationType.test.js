// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import uploadEntityFilesMutationAttributes from '../actionAttributes/uploadEntityFilesMutationAttributes';
import composeActionSignature from '../composeActionSignature';

describe('createUploadEntityFilesMutationType', () => {
  test('should create mutation upload file entity type', () => {
    const imageConfig: EntityConfig = {
      name: 'TangibleImage',
      type: 'tangibleFile',
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { TangibleImage: imageConfig } };

    const expectedResult =
      '  uploadTangibleImageFiles(files: [Upload!]!, hashes: [String!]!): [TangibleImage!]!';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      imageConfig,
      generalConfig,
      uploadEntityFilesMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string if theris not file entity', () => {
    const entityConfig: EntityConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'first name',
        },
      ],
    };

    const generalConfig: GeneralConfig = { allEntityConfigs: { Example: entityConfig } };

    const expectedResult = '';

    const entityTypeDic = {};

    const inputDic = {};

    const result = composeActionSignature(
      entityConfig,
      generalConfig,
      uploadEntityFilesMutationAttributes,
      entityTypeDic,
      inputDic,
    );
    expect(result).toEqual(expectedResult);
  });
});
