// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingReorderCreatedInputType from '../../types/inputs/createThingReorderCreatedInputType';

const composeUpdateThingMutationArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const thingReorderCreatedInputType = createThingReorderCreatedInputType(thingConfig);

  const reorderField = thingReorderCreatedInputType
    ? [`, $positions: ${name}ReorderCreatedInput`, ', positions: $positions']
    : ['', ''];

  const result = [
    `mutation update${name}($whereOne: ${name}WhereOneInput!, $data: ${name}UpdateInput!${reorderField[0]}) {`,
    `  update${name}(whereOne: $whereOne, data: $data${reorderField[1]}) {`,
  ];

  return result;
};

export default composeUpdateThingMutationArgs;
