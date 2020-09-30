// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import composeUploadFilesToThingMutationResolver from './composeUploadFilesToThingMutationResolver';

describe('composeUploadFilesToThingMutationResolver', () => {
  test('should compose uploadFilesToThing mutation args ', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
    };

    const expectedResult = [
      'mutation uploadFilesToExample($whereOne: ExampleWhereOneInput!, $data: UploadFilesToExampleInput, $files: [Upload!]!, $options: FilesOfExampleOptionsInput!) {',
      '  uploadFilesToExample(whereOne: $whereOne, data: $data, files: $files, options: $options) {',
    ];

    const result = composeUploadFilesToThingMutationResolver(thingConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should compose uploadFilesToThing mutation args ', () => {
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
      'mutation uploadFilesToExample($whereOne: ExampleWhereOneInput!, $data: UploadFilesToExampleInput, $files: [Upload!]!, $options: FilesOfExampleOptionsInput!, $positions: ExampleReorderUploadedInput) {',
      '  uploadFilesToExample(whereOne: $whereOne, data: $data, files: $files, options: $options, positions: $positions) {',
    ];

    const result = composeUploadFilesToThingMutationResolver(thingConfig);
    expect(result).toEqual(expectedResult);
  });
});
