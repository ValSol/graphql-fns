// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import uploadThingFilesMutationAttributes from '../../types/actionAttributes/uploadThingFilesMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUploadFilesToThingMutationResolver', () => {
  test('should compose uploadFilesToThing mutation args ', () => {
    const prefixName = 'Home';
    const imageConfig: ThingConfig = {
      name: 'Image',
      file: true,
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
      'mutation Home_uploadImageFiles($files: [Upload!]!, $hashes: [String!]!) {',
      '  uploadImageFiles(files: $files, hashes: $hashes) {',
    ];

    const result = composeActionArgs(
      prefixName,
      imageConfig,
      uploadThingFilesMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
