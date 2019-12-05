// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingUploadOptionsInputType from './createThingUploadOptionsInputType';

describe('createThingUploadOptionsInputType', () => {
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

    const result = createThingUploadOptionsInputType(thingConfig);
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
input ExampleUploadOptionsInput {
  target: ExampleFileFieldNamesEnum!
}`;

    const result = createThingUploadOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
