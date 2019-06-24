// @flow
import type { ThingConfig } from '../../flowTypes';

const composeThingQueryArgs = (thingConfig: ThingConfig): Array<string> => {
  const { name } = thingConfig;

  const result = [
    `query ${name}($whereOne: ${name}WhereOneInput!) {`,
    `  ${name}(whereOne: $whereOne) {`,
  ];

  return result;
};

export default composeThingQueryArgs;
