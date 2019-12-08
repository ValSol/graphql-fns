// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createUploadFilesToThingMutationType from './createUploadFilesToThingMutationType';

describe('createUploadFilesToThingMutationType', () => {
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

    const result = createUploadFilesToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string if there are no array fileFields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
        },
      ],
    };
    const expectedResult = '';

    const result = createUploadFilesToThingMutationType(thingConfig);
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
      '  uploadFilesToExample(whereOne: ExampleWhereOneInput!, files: [Upload!]!, options: UploadFilesToExampleOptionsInput!): Example!';

    const result = createUploadFilesToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
