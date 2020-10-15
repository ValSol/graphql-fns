// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFileCountQuery = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  return `query ${name}FileCount($where: FileWhereInput) {
  ${name}FileCount(where: $where)
}`;
};

export default composeThingFileCountQuery;
