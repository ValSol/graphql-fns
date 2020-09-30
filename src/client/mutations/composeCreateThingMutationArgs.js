// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingReorderCreatedInputType from '../../types/inputs/createThingReorderCreatedInputType';

const composeCreateThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const thingReorderCreatedInputType = createThingReorderCreatedInputType(thingConfig);

  const reorderField = thingReorderCreatedInputType
    ? [`, $positions: ${name}ReorderCreatedInput`, ', positions: $positions']
    : ['', ''];

  const result = [
    `mutation create${name}($data: ${name}CreateInput!${reorderField[0]}) {`,
    `  create${name}(data: $data${reorderField[1]}) {`,
  ];

  return result;
};

export default composeCreateThingMutationArgs;
