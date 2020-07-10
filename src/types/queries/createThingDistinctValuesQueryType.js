// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingDistinctValuesOptionsInputType from '../inputs/createThingDistinctValuesOptionsInputType';

const createThingDistinctValuesQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const thingDistinctValuesOptionsInputType = createThingDistinctValuesOptionsInputType(
    thingConfig,
  );

  if (thingDistinctValuesOptionsInputType) {
    return `  ${name}DistinctValues(where: ${name}WhereInput, options: ${name}DistinctValuesOptionsInput): [String!]!`;
  }

  return '';
};

export default createThingDistinctValuesQueryType;
