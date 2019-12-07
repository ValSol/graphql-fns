// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createUploadFileToThingOptionsInputType from './createUploadFileToThingOptionsInputType';

describe('createUploadFileToThingOptionsInputType', () => {
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

    const result = createUploadFileToThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
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
    const expectedResult = `enum ExampleFileFieldNamesEnum {
  logo
  photos
}
input UploadFileToExampleOptionsInput {
  targets: [ExampleFileFieldNamesEnum!]!
}`;

    const result = createUploadFileToThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
