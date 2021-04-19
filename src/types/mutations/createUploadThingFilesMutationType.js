// @flow

import type { ThingConfig } from '../../flowTypes';

const createUploadThingFilesMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `  upload${name}Files(files: [Upload!]!, hashes: [String!]!): [${name}!]!`;
};

export default createUploadThingFilesMutationType;
