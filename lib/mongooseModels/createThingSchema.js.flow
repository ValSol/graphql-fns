// @flow
import type { ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');
const composeThingSchemaProperties = require('./composeThingSchemaProperties');

const { Schema } = mongoose;

const thingSchemas = {};

const createThingSchema = (thingConfig: ThingConfig): Object => {
  const { name, geospatialFields } = thingConfig;

  if (thingSchemas[name]) return thingSchemas[name];

  const thingSchemaProperties = composeThingSchemaProperties(thingConfig);
  const ThingSchema = new Schema(thingSchemaProperties, { timestamps: true });

  if (geospatialFields) {
    geospatialFields.forEach(({ name: fieldName, type }) => {
      if (type === 'Polygon') {
        ThingSchema.index({ [fieldName]: '2dsphere' });
      }
    });
  }

  // to work dynamic adding fields
  mongoose.model(name, ThingSchema);

  // to supplement cache
  thingSchemas[name] = ThingSchema;

  return ThingSchema;
};

module.exports = createThingSchema;
