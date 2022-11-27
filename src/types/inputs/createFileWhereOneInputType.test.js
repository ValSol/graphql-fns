// @flow
/* eslint-env jest */
import type { EntityConfig } from '../../flowTypes';

import createFileWhereOneInputType from './createFileWhereOneInputType';

describe('createFileWhereOneInputType', () => {
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

  const photoConfig: EntityConfig = {
    name: 'Photo',
    type: 'embedded',
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };

  const entityConfig: EntityConfig = {
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
        required: true,
      },
      {
        name: 'photo',
        config: photoConfig,
        required: true,
      },
    ],
  };

  test('should return empty string if enums undefined', () => {
    const expectedResult = ['FileWhereOneInput', '', {}];

    const result = createFileWhereOneInputType(entityConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string if there are not any enumerations', () => {
    const expectedResult = [
      'FileWhereOneInput',
      `input FileWhereOneInput {
  id: ID
  hash: String
}`,
      {},
    ];

    const result = createFileWhereOneInputType(imageConfig);
    expect(result).toEqual(expectedResult);
  });
});
