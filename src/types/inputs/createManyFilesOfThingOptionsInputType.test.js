// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createManyFilesOfThingOptionsInputType from './createManyFilesOfThingOptionsInputType';

describe('createManyFilesOfThingOptionsInputType', () => {
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

    const result = createManyFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string if there are file scalar fields', () => {
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
      ],
    });
    const expectedResult = '';

    const result = createManyFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string if there are array file fields', () => {
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
    const expectedResult = `enum ExampleManyFilesNamesEnum {
  pictures
}
input ManyFilesOfExampleOptionsInput {
  target: ExampleManyFilesNamesEnum!
}`;

    const result = createManyFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
