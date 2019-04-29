// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereOneInputType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `input ${name}WhereOneInput {
  id: ID!
}`;

  return result;
};

module.exports = createThingWhereOneInputType;
