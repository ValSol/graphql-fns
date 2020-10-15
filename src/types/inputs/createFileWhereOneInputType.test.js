// @flow
/* eslint-env jest */
import type { ThingConfig, GeneralConfig } from '../../flowTypes';

import createFileWhereOneInputType from './createFileWhereOneInputType';

describe('createFileWhereOneInputType', () => {
  test('should return empty string if enums undefined', () => {
    const generalConfig: GeneralConfig = {
      thingConfigs: {},
    };
    const expectedResult = '';

    const result = createFileWhereOneInputType(generalConfig);
    expect(result).toEqual(expectedResult);
  });

  test('should return empty string if there are not any enumerations', () => {
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

    const illustrationConfig: ThingConfig = {
      name: 'Illustration',
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

    const thingConfig2: ThingConfig = {
      name: 'Example2',
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
          name: 'illustration',
          config: illustrationConfig,
          required: true,
        },
      ],
    };

    const generalConfig: GeneralConfig = {
      thingConfigs: {
        Example: thingConfig,
        Example2: thingConfig2,
        Image: imageConfig,
        Illustration: illustrationConfig,
      },
    };

    const expectedResult = `input FileWhereOneInput {
  id: ID
  hash: String
}`;

    const result = createFileWhereOneInputType(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
