// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingFileQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${name}File(whereOne: FileWhereOneInput!): ${name}`;

  return result;
};

export default createThingFileQueryType;
