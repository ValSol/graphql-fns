// @flow

import type { Enums, ThingConfig } from '../flowTypes';

import createThingSchema from './createThingSchema';

const syncedIndexes = {};

const createThing = async (
  mongooseConn: Object,
  thingConfig: ThingConfig,
  enums?: Enums = [],
): Object => {
  const { name } = thingConfig;

  const thingSchema = createThingSchema(thingConfig, enums);

  const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

  if (!syncedIndexes[name]) {
    syncedIndexes[name] = true;
    await Thing.syncIndexes();
  }

  return Thing;
};

export default createThing;
