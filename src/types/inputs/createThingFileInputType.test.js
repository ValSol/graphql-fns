// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createThingFileInputType from './createThingFileInputType';

describe('createThingFileInputType', () => {
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

    const result = createThingFileInputType(thingConfig);
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
input ExampleFileInput {
  file: Upload!
  target: ExampleFileFieldNamesEnum!
}`;

    const result = createThingFileInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
