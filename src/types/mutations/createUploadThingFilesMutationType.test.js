// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import uploadThingFilesMutationAttributes from '../actionAttributes/uploadThingFilesMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

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

    const dic = {};

    const result = composeStandardActionSignature(
      imageConfig,
      uploadThingFilesMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string if theris not file thing', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'first name',
        },
      ],
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(
      thingConfig,
      uploadThingFilesMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
