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
      if (type === 'Point') {
        // eslint-disable-next-line func-names
        ThingSchema.pre('save', function(next) {
          if (this[fieldName].coordinates.length === 0) {
            this[fieldName].coordinates = undefined;
          }
          next();
        });
      } else {
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
