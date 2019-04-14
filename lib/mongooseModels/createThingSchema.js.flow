// @flow
import type { ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

const { Schema } = mongoose;

const thingSchemas = {};

const createThingSchema = (thingConfig: ThingConfig): Object => {
  const { name } = thingConfig;

  if (thingSchemas[name]) return thingSchemas[name];

  const thingSchemaProperties = composeThingSchemaProperties(thingConfig);
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true });

  // to work dynamic adding fields
  mongoose.model(name, ThingSchema);

  // дополняем кеш уже заданных коллекций с индексами
  thingSchemas[name] = ThingSchema;

  return ThingSchema;
};

module.exports = createThingSchema;
