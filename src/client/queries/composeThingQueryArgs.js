// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingQueryArgs = (prefixName: string, thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `query ${prefixName}_${name}($whereOne: ${name}WhereOneInput!) {`,
    `  ${name}(whereOne: $whereOne) {`,
  ];

  return result;
};

export default composeThingQueryArgs;
