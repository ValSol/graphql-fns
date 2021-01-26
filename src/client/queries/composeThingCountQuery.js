// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingCountQuery = (prefixName: string, thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `query ${prefixName}_${name}Count($where: ${name}WhereInput) {
  ${name}Count(where: $where)
}`;
};

export default composeThingCountQuery;
