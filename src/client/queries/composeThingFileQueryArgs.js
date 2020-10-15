// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingFileQueryArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `query ${name}File($whereOne: FileWhereOneInput!) {`,
    `  ${name}File(whereOne: $whereOne) {`,
  ];

  return result;
};

export default composeThingFileQueryArgs;
