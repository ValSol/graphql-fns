// @flow

import type { Enums, EntityConfig } from '../flowTypes';

import createFileSchema from './createFileSchema';
import createThingSchema from './createThingSchema';

const syncedIndexes = {};

const createMongooseModel = async (
  mongooseConn: Object,
  entityConfig: EntityConfig,
  enums?: Enums = {},
): Object => {
  const { name, type: configType } = entityConfig;

  if (configType === 'tangible') {
    const thingSchema = createThingSchema(entityConfig, enums);

    const ThingModel = mongooseConn.model(`${name}_Thing`, thingSchema);

    if (!syncedIndexes[name]) {
      syncedIndexes[name] = true;
      await ThingModel.syncIndexes();
    }

    return ThingModel;
  }

  if (configType === 'tangibleFile') {
    const fileSchema = createFileSchema(entityConfig);

    const nakedName = name.slice('Tangible'.length);

    const FileModel = mongooseConn.model(`${nakedName}_File`, fileSchema);

    return FileModel;
  }

  throw new TypeError(`Incorrect type: "${configType}" in config with name: "${name}"!`);
};

export default createMongooseModel;
