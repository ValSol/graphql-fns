// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createFileOfThingOptionsInputType from './createFileOfThingOptionsInputType';

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

    const result = createFileOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
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
    const expectedResult = `enum ExampleFileGeneralNamesEnum {
  logo
  photos
}
input FileOfExampleOptionsInput {
  target: ExampleFileGeneralNamesEnum!
}`;

    const result = createFileOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
