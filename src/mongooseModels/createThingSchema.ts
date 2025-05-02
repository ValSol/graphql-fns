import mongoose from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

import composeCompoundIndexes from './composeCompoundIndexes';
import composeTextIndexProperties from './composeTextIndexProperties';
import composeThingSchemaProperties from './composeThingSchemaProperties';
import composePolygonIndexProperties from './composePolygonIndexProperties';

const { Schema } = mongoose;

const thingSchemas: Record<string, any> = {};

const createThingSchema = (entityConfig: EntityConfig, enums: Enums = {}): any => {
  const { name, type: entityType } = entityConfig;

  if (thingSchemas[name]) return thingSchemas[name];

  const thingSchemaProperties = composeThingSchemaProperties(entityConfig, enums);
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true });
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

    const polygonIndexProperties = composePolygonIndexProperties(entityConfig);

    polygonIndexProperties.forEach((name) => {
      ThingSchema.index({ [name]: '2dsphere' });
    });
  }

  // to work dynamic adding fields
  mongoose.models[`${name}_Thing`] || mongoose.model(`${name}_Thing`, ThingSchema);

  // to supplement cache
  thingSchemas[name] = ThingSchema;

  return ThingSchema;
};

export default createThingSchema;
