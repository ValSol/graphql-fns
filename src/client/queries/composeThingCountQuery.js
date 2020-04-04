// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingCountQuery = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `query ${name}Count($where: ${name}WhereInput) {
  ${name}Count(where: $where)
}`;
};

export default composeThingCountQuery;
