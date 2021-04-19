// @flow

import type { ThingConfig } from '../../flowTypes';

import createThingReorderCreatedInputType from '../inputs/createThingReorderCreatedInputType';

const createCreateThingMutationType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const mutationArgs = [`data: ${name}CreateInput!`];

  const thingReorderCreatedInputType = createThingReorderCreatedInputType(thingConfig);
  if (thingReorderCreatedInputType) {
    mutationArgs.push(`positions: ${name}ReorderCreatedInput`);
  }

  return `  create${name}(${mutationArgs.join(', ')}): ${name}!`;
};

export default createCreateThingMutationType;
