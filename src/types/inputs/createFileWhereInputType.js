// @flow

import type { InputCreator } from '../../flowTypes';

const createFileWhereInputType: InputCreator = (thingConfig) => {
  const inputName = 'FileWhereInput';

  const inputDefinition =
    thingConfig.type === 'file'
      ? `input FileWhereInput {
  id_in: [ID!]
  id_nin: [ID!]
  createdAt_in: [DateTime!]
  createdAt_nin: [DateTime!]
  createdAt_ne: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  createdAt_lt: DateTime
  createdAt_lte: DateTime
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
}`
      : '';

  return [inputName, inputDefinition, {}];
};

export default createFileWhereInputType;
