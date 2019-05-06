// @flow
import type { Enums, ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

const { Schema } = mongoose;

const thingSchemas = {};

const createThingSchema = (thingConfig: ThingConfig, enums: Enums): Object => {
  const { name } = thingConfig;

  if (thingSchemas[name]) return thingSchemas[name];

  const thingSchemaProperties = composeThingSchemaProperties(thingConfig, enums);
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true });

  // to work dynamic adding fields
  mongoose.model(name, ThingSchema);

  // to supplement cache
  thingSchemas[name] = ThingSchema;

  return ThingSchema;
};

module.exports = createThingSchema;
