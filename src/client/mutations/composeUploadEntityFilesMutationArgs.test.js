// @flow
/* eslint-env jest */

import type { EntityConfig, GeneralConfig } from '../../flowTypes';

import uploadEntityFilesMutationAttributes from '../../types/actionAttributes/uploadEntityFilesMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUploadFilesToEntityMutationResolver', () => {
  const generalConfig: GeneralConfig = {};

  test('should compose uploadFilesToEntity mutation args ', () => {
    const prefixName = 'Home';
    const imageConfig: EntityConfig = {
      name: 'RootImage',
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

    const expectedResult = [
      'mutation Home_uploadRootImageFiles($files: [Upload!]!, $hashes: [String!]!) {',
      '  uploadRootImageFiles(files: $files, hashes: $hashes) {',
    ];

    const result = composeActionArgs(
      prefixName,
      imageConfig,
      generalConfig,
      uploadEntityFilesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
