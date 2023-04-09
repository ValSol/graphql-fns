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
        type: 'textFields',
      },
      {
        name: 'address',
        type: 'textFields',
      },
    ],
  };

  const tangibleImageConfig: TangibleFileEntityConfig = {
    name: 'TangibleImage',
    type: 'tangibleFile',
    textFields: [
      {
        name: 'fileId',
        type: 'textFields',
      },
      {
        name: 'address',
        type: 'textFields',
      },
    ],
  };

  const photoConfig: EmbeddedEntityConfig = {
    name: 'Photo',
    type: 'embedded',
    textFields: [
      {
        name: 'fileId',
        type: 'textFields',
      },
      {
        name: 'address',
        type: 'textFields',
      },
    ],
  };

  const entityConfig: TangibleEntityConfig = {
    name: 'Example',
    type: 'tangible',
    textFields: [
      {
        name: 'textField',
        type: 'textFields',
      },
    ],
    fileFields: [
      {
        name: 'logo',
        config: imageConfig,
        required: true,
        type: 'fileFields',
      },
    ],
    embeddedFields: [
      {
        name: 'photo',
        config: photoConfig,
        required: true,
        type: 'embeddedFields',
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
