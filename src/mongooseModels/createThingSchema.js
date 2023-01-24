// @flow
import mongoose from 'mongoose';

import type { Enums, EntityConfig } from '../flowTypes';

import composeTextIndexProperties from './composeTextIndexProperties';
import composeThingSchemaProperties from './composeThingSchemaProperties';

const { Schema } = mongoose;

const thingSchemas = {};

const createThingSchema = (entityConfig: EntityConfig, enums?: Enums = []): Object => {
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
      weightsKeys.reduce((prev, key) => ({ ...prev, [key]: 'text' }), {}),
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
