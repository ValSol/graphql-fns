// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import uploadFilesToThingMutationAttributes from '../../types/actionAttributes/uploadFilesToThingMutationAttributes';
import composeActionArgs from '../utils/composeActionArgs';

describe('composeUploadFilesToThingMutationResolver', () => {
  test('should compose uploadFilesToThing mutation args ', () => {
    const prefixName = 'Home';

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

    const thingConfig: ThingConfig = {
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
      thingConfig,
      uploadFilesToThingMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });

  test('should compose uploadFilesToThing mutation args ', () => {
    const prefixName = 'Home';
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
      thingConfig,
      uploadFilesToThingMutationAttributes,
      {},
    );
    expect(result).toEqual(expectedResult);
  });
});
