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
    const imageConfig: ThingConfig = {
      name: 'Image',
      embedded: true,
      textFields: [
        {
          name: 'fileId',
        },
        {
          name: 'address',
        },
      ],
    };

    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
      ],
    });
    const expectedResult = `enum ExampleFileNamesEnum {
  logo
  pictures
}
input FileOfExampleOptionsInput {
  target: ExampleFileNamesEnum!
}`;

    const result = createFileOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
