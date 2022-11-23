// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createFilesOfThingOptionsInputType from './createFilesOfThingOptionsInputType';

describe('createUploadFilesToThingOptionsInputType', () => {
  test('should create empty string if there are not any file fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      type: 'tangible',
      textFields: [
        {
          name: 'firstName',
        },
        {
          name: 'lastName',
        },
      ],
    };
    const expectedResult = ['FilesOfExampleOptionsInput', '', {}];

    const result = createFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      type: 'file',
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
      type: 'tangible',
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
    const expectedResult = [
      'FilesOfExampleOptionsInput',
      `enum ExampleFileNamesEnum {
  logo
  pictures
}
input FilesOfExampleOptionsInput {
  targets: [ExampleFileNamesEnum!]!
  counts: [Int!]!
  hashes: [String!]!
}`,
      {},
    ];

    const result = createFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string where freeze fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      type: 'file',
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
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logo',
          config: imageConfig,
          freeze: true,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          freeze: true,
        },
      ],
    });
    const expectedResult = ['FilesOfExampleOptionsInput', '', {}];

    const result = createFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string without freeze fields', () => {
    const imageConfig: ThingConfig = {
      name: 'Image',
      type: 'file',
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
      type: 'tangible',
      textFields: [
        {
          name: 'textField',
        },
      ],
      fileFields: [
        {
          name: 'logos',
          config: imageConfig,
          freeze: true,
          array: true,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
        },
        {
          name: 'logo',
          config: imageConfig,
        },
        {
          name: 'picture',
          config: imageConfig,
          freeze: true,
          array: true,
        },
      ],
    });
    const expectedResult = [
      'FilesOfExampleOptionsInput',
      `enum ExampleFileNamesEnum {
  pictures
  logo
}
input FilesOfExampleOptionsInput {
  targets: [ExampleFileNamesEnum!]!
  counts: [Int!]!
  hashes: [String!]!
}`,
      {},
    ];

    const result = createFilesOfThingOptionsInputType(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
