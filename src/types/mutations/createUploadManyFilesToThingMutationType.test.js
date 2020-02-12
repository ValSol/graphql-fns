// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import createUploadManyFilesToThingMutationType from './createUploadManyFilesToThingMutationType';

describe('createUploadManyFilesToThingMutationType', () => {
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

    const result = createUploadManyFilesToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string if there are no array fileFields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
      ],
    };
    const expectedResult = '';

    const result = createUploadManyFilesToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation upload file thing type', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
          generalName: 'generalFile',
          fileType: 'fileType',
        },
        {
          name: 'photos',
          generalName: 'generalFile',
          fileType: 'fileType',
          array: true,
        },
      ],
    };
    const expectedResult =
      '  uploadManyFilesToExample(whereOne: ExampleWhereOneInput!, files: [Upload!]!, options: UploadManyFilesToExampleOptionsInput!): Example!';

    const result = createUploadManyFilesToThingMutationType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
