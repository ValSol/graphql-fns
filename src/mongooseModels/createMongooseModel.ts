import { Connection } from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

import createFileSchema from './createFileSchema';
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

  if (configType === 'tangibleFile') {
    const fileSchema = createFileSchema(entityConfig);

    const nakedName = name.slice('Tangible'.length);

    const FileModel =
      mongooseConn.models[`${nakedName}_File`] ||
      mongooseConn.model(`${nakedName}_File`, fileSchema);

    return FileModel;
  }

  throw new TypeError(`Incorrect type: "${configType}" in config with name: "${name}"!`);
};

export default createMongooseModel;
