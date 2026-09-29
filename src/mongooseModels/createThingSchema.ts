import mongoose from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

import composeCompoundIndexes from './composeCompoundIndexes';
import composeTextIndexProperties from './composeTextIndexProperties';
import composeThingSchemaProperties from './composeThingSchemaProperties';
import composePolygonOrLineStringIndexProperties from './composePolygonOrLineStringIndexProperties';

const { Schema } = mongoose;

const thingSchemas: Record<string, any> = {};

const createThingSchema = (entityConfig: EntityConfig, enums: Enums = {}): any => {
  const { name, type: entityType } = entityConfig;

  if (thingSchemas[name]) return thingSchemas[name];

  const thingSchemaProperties = composeThingSchemaProperties(entityConfig, enums);
  // indexes are built only by "syncModelIndexes" (see "createMongooseModel"): the background
  // "autoIndex" silently fails on conflicting documents and never drops indexes absent in the config
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true, autoIndex: false });
  ThingSchema.index({ createdAt: 1 });
  ThingSchema.index({ updatedAt: 1 });

  const weights = composeTextIndexProperties(entityConfig);

  const weightsKeys = Object.keys(weights);
  if (weightsKeys.length > 0) {
    ThingSchema.index(
      weightsKeys.reduce<Record<string, any>>((prev, key) => ({ ...prev, [key]: 'text' }), {}),
      { weights, name: 'TextIndex' },
    );
  }

  if (entityType === 'tangible') {
    composeCompoundIndexes(entityConfig).forEach((index) => {
      ThingSchema.index(index, { unique: true });
    });

    const polygonIndexProperties = composePolygonOrLineStringIndexProperties(entityConfig);

    polygonIndexProperties.forEach((name) => {
      ThingSchema.index({ [name]: '2dsphere' });
    });

    const { length: indexesLength } = ThingSchema.indexes();

    if (indexesLength > 64) {
      throw new TypeError(
        `For "${name}" entity created ${indexesLength} indexes but MongoDB allows a maximum of 64 indexes per collection!`,
      );
    }
  }

  // to supplement cache (models are registered on the connection only by "createMongooseModel")
  thingSchemas[name] = ThingSchema;

  return thingSchemas[name];
};

export default createThingSchema;
