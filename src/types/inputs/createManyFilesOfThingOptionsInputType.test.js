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

    const result = createManyFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string if there are array file fields', () => {
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
    const expectedResult = `enum ExampleManyFilesGeneralNamesEnum {
  photos
}
input ManyFilesOfExampleOptionsInput {
  target: ExampleManyFilesGeneralNamesEnum!
}`;

    const result = createManyFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
