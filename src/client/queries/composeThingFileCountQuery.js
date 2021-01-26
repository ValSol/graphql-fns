// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFileCountQuery = (prefixName: string, thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `query ${prefixName}_${name}FileCount($where: FileWhereInput) {
  ${name}FileCount(where: $where)
}`;
};

export default composeThingFileCountQuery;
