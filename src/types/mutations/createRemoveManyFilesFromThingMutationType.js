// @flow

import type { ThingConfig } from '../../flowTypes';

import createManyFilesOfThingOptionsInputType from '../inputs/createManyFilesOfThingOptionsInputType';

const createRemoveManyFilesFromThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const fileOfThingOptionsInput = createManyFilesOfThingOptionsInputType(thingConfig);

  if (fileOfThingOptionsInput) {
    return `  removeManyFilesFrom${name}(whereOne: ${name}WhereOneInput!, data: [String!]!, options: ManyFilesOf${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createRemoveManyFilesFromThingMutationType;
