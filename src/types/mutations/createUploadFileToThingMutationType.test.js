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
      '  uploadFileToExample(whereOne: ExampleWhereOneInput!, file: Upload!, options: UploadFileToExampleOptionsInput!): Example!';

    const result = createUploadFileToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
