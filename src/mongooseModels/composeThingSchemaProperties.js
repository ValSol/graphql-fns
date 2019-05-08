// @flow
import type { Enums, ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');

type ThingSchemaProperty = { type: String | [String], default: string, required: boolean };
type ThingSchemaProperties = { [key: string]: ThingSchemaProperty };

const { Schema } = mongoose;

const composeThingSchemaProperties = (
  thingConfig: ThingConfig,
  enums: Enums,
): ThingSchemaProperties => {
  const {
    embedded,
    booleanFields,
    duplexFields,
    embeddedFields,
    enumFields,
    geospatialFields,
    relationalFields,
  } = thingConfig;

  const scalarFieldTypes = [
    { fieldTypeName: 'textFields', mongoType: String },
    { fieldTypeName: 'dateTimeFields', mongoType: Date },
    { fieldTypeName: 'intFields', mongoType: Number },
    { fieldTypeName: 'floatFields', mongoType: Number },
  ];
  const result = scalarFieldTypes.reduce((prev, { fieldTypeName, mongoType }) => {
    if (thingConfig[fieldTypeName]) {
      thingConfig[fieldTypeName].forEach(
        ({ array, default: defaultValue, index, name, required, unique }) => {
          if (defaultValue) {
            if (!array && Array.isArray(defaultValue)) {
              throw new TypeError('Expected not an array as default value');
            }
            if (array && !Array.isArray(defaultValue)) {
              throw new TypeError('Expected an array as default value');
            }
          }

          if ((index || unique) && embedded) {
            throw new TypeError(
              'Must not have an "index" or "unique" field in an embedded document!',
            );
          }

          // eslint-disable-next-line no-param-reassign
          prev[name] = {
            type: array ? [mongoType] : mongoType,
          };
          if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
          // eslint-disable-next-line no-param-reassign
          if (required) prev[name].required = !!required; // by default required = false
          if (unique) prev[name].unique = !!unique; // eslint-disable-line no-param-reassign
          if (index && !unique) prev[name].index = !!index; // eslint-disable-line no-param-reassign
        },
      );
    }
    return prev;
  }, {});

  if (booleanFields) {
    booleanFields.reduce((prev, { array, default: defaultValue, index, name, required }) => {
      if (defaultValue) {
        if (!array && Array.isArray(defaultValue)) {
          throw new TypeError('Expected not an array as default value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as default value');
        }
      }
      // eslint-disable-next-line no-param-reassign
      prev[name] = { type: array ? [Boolean] : Boolean };
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = !!required; // by default required = false
      if (index) prev[name].index = !!index; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce(
      (prev, { array, config: { name: relationalThingName }, index, name, required }) => {
        if (index && embedded) {
          throw new TypeError('Must not have an "index" field in an embedded document!');
        }
        const obj: { ref: string, type: string, required?: boolean, index?: boolean } = {
          ref: relationalThingName,
          type: Schema.Types.ObjectId,
        };
        if (!required) obj.required = !!required; // by default required = true
        if (index) obj.index = !!index;
        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
        return prev;
      },
      result,
    );
  }

  if (duplexFields) {
    if (embedded) {
      throw new TypeError('Must not have an "duplexField" in an embedded document!');
    }
    duplexFields.reduce(
      (prev, { array, config: { name: duplexThingName }, index, name, required }) => {
        // the same code as for relationalFields
        const obj: { ref: string, type: string, required?: boolean, index?: boolean } = {
          ref: duplexThingName,
          type: Schema.Types.ObjectId,
        };
        if (!required) obj.required = !!required; // by default required = true
        if (index) obj.index = !!index;
        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
        return prev;
      },
      result,
    );
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { array, name, config }) => {
      const obj = composeThingSchemaProperties(config, enums);
      // eslint-disable-next-line no-param-reassign
      prev[name] = array ? [obj] : obj;
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name, required, type }) => {
      if (type === 'Point') {
        const obj: Object = {
          type: {
            type: String,
            enum: ['Point'],
          },
          coordinates: {
            type: [Number],
            index: '2dsphere',
          },
        };
        if (required) obj.required = !!required; // by default required = false

        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
      } else if (type === 'Polygon') {
        const obj: Object = {
          type: {
            type: String,
            enum: ['Polygon'],
          },
          coordinates: {
            type: [[[Number]]],
          },
        };
        if (required) obj.required = !!required; // by default required = false

        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
      } else {
        throw new TypeError(`Invalid value "${type}" of geospatial field type!`);
      }
      return prev;
    }, result);
  }

  if (enumFields) {
    const enumObject = enums.reduce((prev, { name, enum: enumeration }) => {
      // eslint-disable-next-line no-param-reassign
      prev[name] = enumeration;
      return prev;
    }, {});
    enumFields.reduce((prev, { array, default: defaultValue, index, name, required, enumName }) => {
      if (defaultValue) {
        if (!array && !(typeof defaultValue === 'string')) {
          throw new TypeError('Expected a string as default value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as default value');
        }
      }

      if (index && embedded) {
        throw new TypeError('Must not have an "index" field in an embedded document!');
      }

      // eslint-disable-next-line no-param-reassign
      prev[name] = {
        enum: enumObject[enumName],
        type: array ? [String] : String,
      };
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = !!required; // by default required = false
      if (index) prev[name].index = !!index; // eslint-disable-line no-param-reassign
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  return result;
};

module.exports = composeThingSchemaProperties;
