// @flow

import type { ThingConfig } from '../../flowTypes';

import createFileOfThingOptionsInputType from '../inputs/createFileOfThingOptionsInputType';

const createRemoveFileFromThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const fileOfThingOptionsInput = createFileOfThingOptionsInputType(thingConfig);

  if (fileOfThingOptionsInput) {
    return `  removeFileFrom${name}(whereOne: ${name}WhereOneInput!, data: [String!]!, options: FileOf${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createRemoveFileFromThingMutationType;
