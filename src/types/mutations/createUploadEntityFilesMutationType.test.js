// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import uploadEntityFilesMutationAttributes from '../actionAttributes/uploadEntityFilesMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createUploadEntityFilesMutationType', () => {
  test('should create mutation upload file entity type', () => {
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

    const expectedResult =
      '  uploadRootImageFiles(files: [Upload!]!, hashes: [String!]!): [RootImage!]!';

    const dic = {};

    const result = composeStandardActionSignature(
      imageConfig,
      uploadEntityFilesMutationAttributes,
      dic,
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
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(
      entityConfig,
      uploadEntityFilesMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
