// @flow
import type { ThingConfig } from '../../flowTypes';

import createThingWhereInputType from '../../types/inputs/createThingWhereInputType';

const composeThingCountQuery = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const ThingWhereInputType = createThingWhereInputType(thingConfig);
  if (ThingWhereInputType) {
    return `query ${name}Count($where: ${name}WhereInput) {
  ${name}Count(where: $where)
}`;
  }
  return `query ${name}Count {
  ${name}Count
}`;
};

export default composeThingCountQuery;
