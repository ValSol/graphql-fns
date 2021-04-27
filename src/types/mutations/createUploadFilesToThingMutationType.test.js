// @flow
/* eslint-env jest */

import type { ThingConfig } from '../../flowTypes';

import uploadFilesToThingMutationAttributes from '../actionAttributes/uploadFilesToThingMutationAttributes';
import composeStandardActionSignature from '../composeStandardActionSignature';

describe('createUploadFilesToThingMutationType', () => {
  test('should create empty string if there are no fileFields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'first name',
        },
      ],
    };
    const expectedResult = '';
    const dic = {};

    const result = composeStandardActionSignature(
      thingConfig,
      uploadFilesToThingMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation upload file thing type', () => {
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
      ],
    });
    const expectedResult =
      '  uploadFilesToExample(whereOne: ExampleWhereOneInput!, data: UploadFilesToExampleInput, files: [Upload!]!, options: FilesOfExampleOptionsInput!): Example!';
    const dic = {};

    const result = composeStandardActionSignature(
      thingConfig,
      uploadFilesToThingMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });

  test('should create mutation upload file thing type', () => {
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
    const expectedResult =
      '  uploadFilesToExample(whereOne: ExampleWhereOneInput!, data: UploadFilesToExampleInput, files: [Upload!]!, options: FilesOfExampleOptionsInput!, positions: ExampleReorderUploadedInput): Example!';
    const dic = {};

    const result = composeStandardActionSignature(
      thingConfig,
      uploadFilesToThingMutationAttributes,
      dic,
    );
    expect(result).toEqual(expectedResult);
  });
});
