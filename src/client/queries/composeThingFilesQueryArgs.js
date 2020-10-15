// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFilesQueryArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `query ${name}Files($where: FileWhereInput) {`,
    `  ${name}Files(where: $where) {`,
  ];

  return result;
};

export default composeThingFilesQueryArgs;
