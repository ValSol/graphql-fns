// @flow
/* eslint-env jest */
import type { ThingConfig } from '../../flowTypes';

import createFileWhereOneInputType from './createFileWhereOneInputType';

describe('createFileWhereOneInputType', () => {
  const imageConfig: ThingConfig = {
    name: 'Image',
    file: true,
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };

  const photoConfig: ThingConfig = {
    name: 'Photo',
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

  const thingConfig: ThingConfig = {
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

    const result = createFileWhereOneInputType(thingConfig);
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
