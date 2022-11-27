// @flow
/* eslint-env jest */

import type { EntityConfig } from '../../flowTypes';

import uploadFilesToEntityMutationAttributes from '../../types/actionAttributes/uploadFilesToEntityMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUploadFilesToEntityMutationResolver', () => {
  test('should compose uploadFilesToEntity mutation args ', () => {
    const prefixName = 'Home';

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
          name: 'hero',
          config: imageConfig,
        },
      ],
    };

    const expectedResult = [
      'mutation Home_uploadFilesToExample($whereOne: ExampleWhereOneInput!, $data: UploadFilesToExampleInput, $files: [Upload!]!, $options: FilesOfExampleOptionsInput!) {',
      '  uploadFilesToExample(whereOne: $whereOne, data: $data, files: $files, options: $options) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      uploadFilesToEntityMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose uploadFilesToEntity mutation args ', () => {
    const prefixName = 'Home';
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
          required: true,
        },
        {
          name: 'hero',
          config: imageConfig,
        },
        {
          name: 'pictures',
          config: imageConfig,
          array: true,
          required: true,
        },
        {
          name: 'photos',
          config: imageConfig,
          array: true,
        },
      ],
    });

    const expectedResult = [
      'mutation Home_uploadFilesToExample($whereOne: ExampleWhereOneInput!, $data: UploadFilesToExampleInput, $files: [Upload!]!, $options: FilesOfExampleOptionsInput!, $positions: ExampleReorderUploadedInput) {',
      '  uploadFilesToExample(whereOne: $whereOne, data: $data, files: $files, options: $options, positions: $positions) {',
    ];

    const result = composeActionArgs(
      prefixName,
      entityConfig,
      uploadFilesToEntityMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
