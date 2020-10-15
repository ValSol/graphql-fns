// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingFilesQueryType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `  ${name}Files(where: FileWhereInput): [${name}!]!`;

  return result;
};

export default createThingFilesQueryType;
