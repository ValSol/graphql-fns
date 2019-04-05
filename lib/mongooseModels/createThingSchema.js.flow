// @flow
const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

type TextField = {
  name: string,
  default?: string | Array<string>,
  required?: boolean,
  array?: boolean,
};
type ThingConfig = { textFields?: Array<TextField>, thingName: string };

const { Schema } = mongoose;

const thingSchemas = {};

const createThingSchema = (thingConfig: ThingConfig): Object => {
  const { thingName } = thingConfig;

  if (thingSchemas[thingName]) return thingSchemas[thingName];

  const thingSchemaProperties = composeThingSchemaProperties(thingConfig);
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true });

  // to work dynamic adding fields
  mongoose.model(thingName, ThingSchema);

  // дополняем кеш уже заданных коллекций с индексами
  thingSchemas[thingName] = ThingSchema;

  return ThingSchema;
};

module.exports = createThingSchema;
