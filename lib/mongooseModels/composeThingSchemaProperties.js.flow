// @flow
import type { ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');

type ThingSchemaProperty = { type: String | [String], default: string, required: boolean };
type ThingSchemaProperties = { [key: string]: ThingSchemaProperty };

const { Schema } = mongoose;

const composeThingSchemaProperties = (thingConfig: ThingConfig): ThingSchemaProperties => {
  const {
    isEmbedded,
    duplexFields,
    embeddedFields,
    geospatialFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = {};
  if (textFields) {
    textFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
      if (defaultValue) {
        if (!array && !(typeof defaultValue === 'string')) {
          throw new TypeError('Expected a string as defalut value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as defalut value');
        }
      }

      if ((index || unique) && isEmbedded) {
        throw new TypeError('Must not have an "index" or "unique" field in an embedded document!');
      }

      // eslint-disable-next-line no-param-reassign
      prev[name] = {
        default: defaultValue || (array ? [] : ''),
        type: array ? [String] : String,
      };
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = !!required; // by default required = false
      if (unique) prev[name].unique = !!unique; // eslint-disable-line no-param-reassign
      if (index && !unique) prev[name].index = !!index; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce(
      (prev, { array, config: { name: relationalThingName }, index, name, required }) => {
        if (index && isEmbedded) {
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
    if (isEmbedded) {
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
      const obj = composeThingSchemaProperties(config);
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
            required: true,
          },
          coordinates: {
            type: [Number],
            required: true,
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
            required: true,
          },
          coordinates: {
            type: [[[Number]]],
            required: true,
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

  return result;
};

module.exports = composeThingSchemaProperties;
