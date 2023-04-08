import mongoose from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

import composeTextIndexProperties from './composeTextIndexProperties';
import composeThingSchemaProperties from './composeThingSchemaProperties';

const { Schema } = mongoose;

const thingSchemas: Record<string, any> = {};

const createThingSchema = (entityConfig: EntityConfig, enums: Enums = {}): any => {
  const { name } = entityConfig;

  if (thingSchemas[name]) return thingSchemas[name];

  const thingSchemaProperties = composeThingSchemaProperties(entityConfig, enums);
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true });
  ThingSchema.index({ createdAt: 1 });
  ThingSchema.index({ updatedAt: 1 });

  const weights = composeTextIndexProperties(entityConfig);

  const weightsKeys = Object.keys(weights);
  if (weightsKeys.length) {
    ThingSchema.index(
      weightsKeys.reduce<Record<string, any>>((prev, key) => ({ ...prev, [key]: 'text' }), {}),
      { weights, name: 'TextIndex' },
    );
  }

  // to work dynamic adding fields
  mongoose.model(`${name}_Thing`, ThingSchema);

  // to supplement cache
  thingSchemas[name] = ThingSchema;

  return ThingSchema;
};

export default createThingSchema;
