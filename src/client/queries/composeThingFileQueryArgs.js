// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFileQueryArgs = (prefixName: string, thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `query ${prefixName}_${name}File($whereOne: FileWhereOneInput!) {`,
    `  ${name}File(whereOne: $whereOne) {`,
  ];

  return result;
};

export default composeThingFileQueryArgs;
