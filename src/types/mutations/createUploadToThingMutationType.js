// @flow

import type { ThingConfig } from '../../flowTypes';

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { name, fileFields } = thingConfig;

  if (fileFields && fileFields.length) {
    return `  uploadTo${name}(data: ${name}FileInput!): ${name}!`;
  }

  return '';
};

export default createCreateThingMutationType;
