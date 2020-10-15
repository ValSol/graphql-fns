// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingFileCountQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${name}FileCount(where: FileWhereInput): Int!`;

  return result;
};

export default createThingFileCountQueryType;
