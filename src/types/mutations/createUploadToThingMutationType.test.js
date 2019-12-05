// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createUploadToThingMutationType from './createUploadToThingMutationType';

describe('createUploadToThingMutationType', () => {
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

    const result = createUploadToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation upload file thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
        },
        {
          name: 'photos',
          array: true,
        },
      ],
    };
    const expectedResult =
      '  uploadToExample(file: Upload!, options: ExampleUploadOptionsInput!): Example!';

    const result = createUploadToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
