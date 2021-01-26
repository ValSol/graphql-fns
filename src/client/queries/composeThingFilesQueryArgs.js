// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFilesQueryArgs = (
  prefixName: string,
  thingConfig: ThingConfig,
): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `query ${prefixName}_${name}Files($where: FileWhereInput) {`,
    `  ${name}Files(where: $where) {`,
  ];

  return result;
};

export default composeThingFilesQueryArgs;
