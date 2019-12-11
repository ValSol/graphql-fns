// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createUploadManyFilesToThingOptionsInputType from './createUploadManyFilesToThingOptionsInputType';

describe('createUploadManyFilesToThingOptionsInputType', () => {
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

    const result = createUploadManyFilesToThingOptionsInputType(thingConfig);
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

    const result = createUploadManyFilesToThingOptionsInputType(thingConfig);
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
input UploadManyFilesToExampleOptionsInput {
  targets: [ExampleFilesFieldNamesEnum!]!
}`;

    const result = createUploadManyFilesToThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
