// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingWhereInputType = (thingConfig: ThingConfig): string => {
  const { thingName } = thingConfig;

  const result = `input ${thingName}WhereInput {
  id: ID!
}`;

  return result;
};

module.exports = createThingWhereInputType;
