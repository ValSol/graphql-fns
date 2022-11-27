// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createFilesOfEntityOptionsInputType from './createFilesOfEntityOptionsInputType';

describe('createFilesOfEntityOptionsInputType', () => {
  test('should create empty string if there are not any file fields', () => {
    const entityConfig: EntityConfig = {
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

    const result = createFilesOfEntityOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string with indexed text fields', () => {
    const imageConfig: EntityConfig = {
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

    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
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

    const result = createFilesOfEntityOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create empty string where freeze fields', () => {
    const imageConfig: EntityConfig = {
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

    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
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

    const result = createFilesOfEntityOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should create string without freeze fields', () => {
    const imageConfig: EntityConfig = {
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

    const entityConfig: EntityConfig = {};
    Object.assign(entityConfig, {
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

    const result = createFilesOfEntityOptionsInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });
});
