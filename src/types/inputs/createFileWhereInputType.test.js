// @flow
/* eslint-env jest */
import type { ThingConfig, GeneralConfig } from '../../flowTypes';

import createFileWhereInputType from './createFileWhereInputType';

describe('createFileWhereInputType', () => {
  test('should return empty string if enums undefined', () => {
    const generalConfig: GeneralConfig = {
      thingConfigs: {},
    };
    const expectedResult = '';

    const result = createFileWhereInputType(generalConfig);
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

    const expectedResult = `input FileWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt: DateTime
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  updatedAt: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_nin: [DateTime!]
  updatedAt_ne: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  uploadedAt: DateTime
  uploadedAt_in: [DateTime!]
  uploadedAt_nin: [DateTime!]
  uploadedAt_ne: DateTime
  uploadedAt_gt: DateTime
  uploadedAt_gte: DateTime
  uploadedAt_lt: DateTime
  uploadedAt_lte: DateTime
  filename_in: [String!]
  filename_nin: [String!]
  filename_ne: String
  mimetype_in: [String!]
  mimetype_nin: [String!]
  mimetype_ne: String
  encoding_in: [String!]
  encoding_nin: [String!]
  encoding_ne: String
  hash_in: [String!]
  hash_nin: [String!]
  hash_ne: String
  AND: [FileWhereInput!]
  NOR: [FileWhereInput!]
  OR: [FileWhereInput!]
}`;

    const result = createFileWhereInputType(generalConfig);
    expect(result).toEqual(expectedResult);
  });
});
