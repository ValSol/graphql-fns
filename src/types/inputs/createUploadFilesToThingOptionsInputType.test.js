// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createUploadFilesToThingOptionsInputType from './createUploadFilesToThingOptionsInputType';

describe('createUploadFilesToThingOptionsInputType', () => {
  test('should create empty string if there are not any file fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = '';

    const result = createUploadFilesToThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string if there are file scalar fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      fileFields: [
        {
          name: 'logo',
        },
      ],
    };
    const expectedResult = '';

    const result = createUploadFilesToThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string if there are array file fields', () => {
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
    const expectedResult = `enum ExampleFilesFieldNamesEnum {
  photos
}
input UploadFilesToExampleOptionsInput {
  targets: [ExampleFilesFieldNamesEnum!]!
}`;

    const result = createUploadFilesToThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
