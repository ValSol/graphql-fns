// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingReorderCreatedInputType from '../inputs/createThingReorderCreatedInputType';

const createDeleteThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingReorderCreatedInputType = createThingReorderCreatedInputType(thingConfig);

  const reorderField = thingReorderCreatedInputType
    ? `, positions: ${name}ReorderCreatedInput`
    : '';

  const result = `  update${name}(whereOne: ${name}WhereOneInput!, data: ${name}UpdateInput!${reorderField}): ${name}!`;
  return result;
};

export default createDeleteThingMutationType;
