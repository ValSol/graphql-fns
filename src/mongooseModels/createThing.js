// @flow

import type { Enums, EntityConfig } from '../flowTypes';

import createThingSchema from './createThingSchema';

const syncedIndexes = {};

const createEntity = async (
  mongooseConn: Object,
  entityConfig: EntityConfig,
  enums?: Enums = [],
): Object => {
  const { name } = entityConfig;

  const thingSchema = createThingSchema(entityConfig, enums);

  const Entity = mongooseConn.model(`${name}_Thing`, thingSchema);

  if (!syncedIndexes[name]) {
    syncedIndexes[name] = true;
    await Entity.syncIndexes();
  }

  return Entity;
};

export default createEntity;
