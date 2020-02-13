// @flow

import type { ThingConfig } from '../../flowTypes';

import createManyFilesOfThingOptionsInputType from '../inputs/createManyFilesOfThingOptionsInputType';

const createUploadManyFilesToThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const manyFilesOfThingOptionsInput = createManyFilesOfThingOptionsInputType(thingConfig);

  if (manyFilesOfThingOptionsInput) {
    return `  uploadManyFilesTo${name}(whereOne: ${name}WhereOneInput!, files: [Upload!]!, options: ManyFilesOf${name}OptionsInput!): ${name}!`;
  }

  return '';
};

export default createUploadManyFilesToThingMutationType;
