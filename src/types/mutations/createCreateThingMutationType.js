// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingReorderCreatedInputType from '../inputs/createThingReorderCreatedInputType';

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingReorderCreatedInputType = createThingReorderCreatedInputType(thingConfig);

  const reorderField = thingReorderCreatedInputType
    ? `, positions: ${name}ReorderCreatedInput`
    : '';

  const result = `  create${name}(data: ${name}CreateInput!${reorderField}): ${name}!`;

  return result;
};

export default createCreateThingMutationType;
