// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createUploadThingFilesMutationType from './createUploadThingFilesMutationType';

describe('createUploadThingFilesMutationType', () => {
  test('should create mutation upload file thing type', () => {
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

    const expectedResult = '  uploadImageFiles(files: [Upload!]!, hashes: [String!]!): [Image!]!';

    const result = createUploadThingFilesMutationType(imageConfig);
    expect(result).toEqual(expectedResult);
  });
});
