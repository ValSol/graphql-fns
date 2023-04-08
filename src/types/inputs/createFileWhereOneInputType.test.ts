/* eslint-env jest */
import type {
  EmbeddedEntityConfig,
  FileEntityConfig,
  TangibleFileEntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

import createFileWhereOneInputType from './createFileWhereOneInputType';

describe('createFileWhereOneInputType', () => {
  const imageConfig: FileEntityConfig = {
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

  const tangibleImageConfig: TangibleFileEntityConfig = {
    name: 'TangibleImage',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'fileId',
      },
      {
        name: 'address',
      },
    ],
  };

  const photoConfig: EmbeddedEntityConfig = {
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

  const entityConfig: TangibleEntityConfig = {
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
    ],
    embeddedFields: [
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

    const result = createFileWhereOneInputType(tangibleImageConfig);
    expect(result).toEqual(expectedResult);
  });
});
