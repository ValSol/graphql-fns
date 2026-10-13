import mongoose from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

import composeCompoundIndexes from './composeCompoundIndexes';
import composeTextIndexProperties from './composeTextIndexProperties';
import composeEntitySchemaProperties from './composeEntitySchemaProperties';
import composePolygonOrLineStringIndexProperties from './composePolygonOrLineStringIndexProperties';

const { Schema } = mongoose;

const entitySchemas: Record<string, any> = {};

const createEntitySchema = (entityConfig: EntityConfig, enums: Enums = {}): any => {
  const { name, type: entityType } = entityConfig;

  if (entitySchemas[name]) return entitySchemas[name];

  const entitySchemaProperties = composeEntitySchemaProperties(entityConfig, enums);
  // indexes are built only by "syncModelIndexes" (see "createMongooseModel"): the background
  // "autoIndex" silently fails on conflicting documents and never drops indexes absent in the config
  const EntitySchema = new Schema(entitySchemaProperties, { timestamps: true, autoIndex: false });
  EntitySchema.index({ createdAt: 1 });
  EntitySchema.index({ updatedAt: 1 });

  const weights = composeTextIndexProperties(entityConfig);

  const weightsKeys = Object.keys(weights);
  if (weightsKeys.length > 0) {
    EntitySchema.index(
      weightsKeys.reduce<Record<string, any>>((prev, key) => ({ ...prev, [key]: 'text' }), {}),
      { weights, name: 'TextIndex' },
    );
  }

  if (entityType === 'tangible') {
    composeCompoundIndexes(entityConfig).forEach((index) => {
      EntitySchema.index(index, { unique: true });
    });

    const polygonIndexProperties = composePolygonOrLineStringIndexProperties(entityConfig);

    polygonIndexProperties.forEach((name) => {
      EntitySchema.index({ [name]: '2dsphere' });
    });

    const { length: indexesLength } = EntitySchema.indexes();

    if (indexesLength > 64) {
      throw new TypeError(
        `For "${name}" entity created ${indexesLength} indexes but MongoDB allows a maximum of 64 indexes per collection!`,
      );
    }
  }

  // to supplement cache (models are registered on the connection only by "createMongooseModel")
  entitySchemas[name] = EntitySchema;

  return entitySchemas[name];
};

export default createEntitySchema;
