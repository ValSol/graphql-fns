// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createUploadFileToThingMutationType from './createUploadFileToThingMutationType';

describe('createUploadFileToThingMutationType', () => {
  test('should create empty string if there are no fileFields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'first name',
        },
      ],
    };
    const expectedResult = '';

    const result = createUploadFileToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation upload file thing type', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          required: true,
        },
        {
          name: 'hero',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          required: true,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
      ],
    });
    const expectedResult =
      '  uploadFileToExample(whereOne: ExampleWhereOneInput!, file: Upload!, options: FileOfExampleOptionsInput!): Example!';

    const result = createUploadFileToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
