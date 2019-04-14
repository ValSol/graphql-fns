// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { name } = thingConfig;

  const result = `input ${name}WhereInput {
  id: ID!
}`;

  return result;
};

module.exports = createThingWhereInputType;
