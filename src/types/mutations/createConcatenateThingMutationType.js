// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingConcatenateInputType from '../inputs/createThingConcatenateInputType';

const createConcatenateThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingConcatenateInputType = createThingConcatenateInputType(thingConfig);

  if (thingConcatenateInputType) {
    return `  concatenate${name}(whereOne: ${name}WhereOneInput!, data: ${name}ConcatenateInput!): ${name}!`;
  }

  return '';
};

export default createConcatenateThingMutationType;
