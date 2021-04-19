// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUploadThingFilesMutationArgs from './composeUploadThingFilesMutationArgs';

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

    const result = composeUploadThingFilesMutationArgs(prefixName, imageConfig);
    expect(result).toEqual(expectedResult);
  });
});
