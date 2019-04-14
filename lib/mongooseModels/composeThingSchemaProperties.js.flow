// @flow
import type { ThingConfig } from '../flowTypes';

const mongoose = require('mongoose');

type ThingSchemaProperty = { type: String | [String], default: string, required: boolean };
type ThingSchemaProperties = { [key: string]: ThingSchemaProperty };

const { Schema } = mongoose;

const composeThingSchemaProperties = (thingConfig: ThingConfig): ThingSchemaProperties => {
  const { embeddedFields, relationalFields, textFields } = thingConfig;

  const result = {};
  if (textFields) {
    textFields.reduce((prev, { array, default: defaultValue, name, required }) => {
      if (defaultValue) {
        if (!array && !(typeof defaultValue === 'string')) {
          throw new TypeError('Expected a string as defalut value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as defalut value');
        }
      }

      // eslint-disable-next-line no-param-reassign
      prev[name] = {
        default: defaultValue || (array ? [] : ''),
        type: array ? [String] : String,
        required: !!required,
      };
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { array, name, required, thingName }) => {
      const obj = {
        ref: thingName,
        type: Schema.Types.ObjectId,
        required: !!required,
      };
      // eslint-disable-next-line no-param-reassign
      prev[name] = array ? [obj] : obj;
      return prev;
    }, result);
  }

  if (embeddedFields) {
    embeddedFields.reduce((prev, { array, name, config }) => {
      const obj = composeThingSchemaProperties(config);
      // eslint-disable-next-line no-param-reassign
      prev[name] = array ? [obj] : obj;
      return prev;
    }, result);
  }

  return result;
};

module.exports = composeThingSchemaProperties;
