import { Connection } from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

import createThingSchema from './createThingSchema';

const syncedIndexes: Record<string, any> = {};

const createMongooseModel = async (
  mongooseConn: Connection,
  entityConfig: EntityConfig,
  enums: Enums = {},
): Promise<any> => {
  const { name, type: configType } = entityConfig;

  if (configType === 'tangible') {
    const thingSchema = createThingSchema(entityConfig, enums);

    const ThingModel =
      mongooseConn.models[`${name}_Thing`] || mongooseConn.model(`${name}_Thing`, thingSchema);

    if (!syncedIndexes[name]) {
      syncedIndexes[name] = true;
      await ThingModel.syncIndexes();
    }

    return ThingModel;
  }

  throw new TypeError(`Incorrect type: "${configType}" in config with name: "${name}"!`);
};

export default createMongooseModel;
