// @flow

import mongoose from 'mongoose';

import type { Enums, ThingConfig } from '../flowTypes';

type ThingSchemaProperty = {
  type: Function | [Function],
  default?: string,
  required?: boolean,
};
type ThingSchemaProperties = { [key: string]: ThingSchemaProperty };

const { Schema } = mongoose;

const composeThingSchemaProperties = (
  thingConfig: ThingConfig,
  enums: Enums,
): ThingSchemaProperties => {
  const {
    booleanFields,
    counter,
    duplexFields,
    dateTimeFields,
    embedded,
    embeddedFields,
    enumFields,
    intFields,
    file,
    fileFields,
    floatFields,
    geospatialFields,
    relationalFields,
    textFields,
  } = thingConfig;

  const result = {};

  if (counter) {
    result.counter = {
      type: Number,
      unique: true,
      required: true,
    };
  }

  if (textFields) {
    textFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
      if (defaultValue) {
        if (!array && Array.isArray(defaultValue)) {
          throw new TypeError('Expected not an array as default value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as default value');
        }
      }

      if ((index || unique) && (embedded || file)) {
        throw new TypeError('Must not have an "index" or "unique" field in an embedded document!');
      } // eslint-disable-next-line no-param-reassign

      prev[name] = { type: array ? [String] : String }; // eslint-disable-line no-param-reassign
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = true; // by default required = false
      if (unique) {
        prev[name].unique = true; // eslint-disable-line no-param-reassign
        if (!required) prev[name].sparse = true; // eslint-disable-line no-param-reassign
      }
      if (index) prev[name].index = true; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (dateTimeFields) {
    dateTimeFields.reduce(
      (prev, { array, default: defaultValue, index, name, required, unique }) => {
        if (defaultValue) {
          if (!array && Array.isArray(defaultValue)) {
            throw new TypeError('Expected not an array as default value');
          }
          if (array && !Array.isArray(defaultValue)) {
            throw new TypeError('Expected an array as default value');
          }
        }

        if ((index || unique) && (embedded || file)) {
          throw new TypeError(
            'Must not have an "index" or "unique" field in an embedded OR file document!',
          );
        } // eslint-disable-next-line no-param-reassign

        prev[name] = { type: array ? [Date] : Date }; // eslint-disable-line no-param-reassign
        if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
        // eslint-disable-next-line no-param-reassign
        if (required) prev[name].required = true; // by default required = false
        if (unique) {
          prev[name].unique = true; // eslint-disable-line no-param-reassign
          if (!required) prev[name].sparse = true; // eslint-disable-line no-param-reassign
        }
        if (index) prev[name].index = true; // eslint-disable-line no-param-reassign
        return prev;
      },
      result,
    );
  }

  if (intFields) {
    intFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
      if (defaultValue) {
        if (!array && Array.isArray(defaultValue)) {
          throw new TypeError('Expected not an array as default value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as default value');
        }
      }

      if ((index || unique) && (embedded || file)) {
        throw new TypeError(
          'Must not have an "index" or "unique" field in an embedded OR file document!',
        );
      } // eslint-disable-next-line no-param-reassign

      prev[name] = { type: array ? [Number] : Number }; // eslint-disable-line no-param-reassign
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = true; // by default required = false
      if (unique) {
        prev[name].unique = true; // eslint-disable-line no-param-reassign
        if (!required) prev[name].sparse = true; // eslint-disable-line no-param-reassign
      }
      if (index) prev[name].index = true; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (floatFields) {
    floatFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
      if (defaultValue) {
        if (!array && Array.isArray(defaultValue)) {
          throw new TypeError('Expected not an array as default value');
        }
        if (array && !Array.isArray(defaultValue)) {
          throw new TypeError('Expected an array as default value');
        }
      }

      if ((index || unique) && (embedded || file)) {
        throw new TypeError(
          'Must not have an "index" or "unique" field in an embedded OR file document!',
        );
      } // eslint-disable-next-line no-param-reassign

      prev[name] = { type: array ? [Number] : Number }; // eslint-disable-line no-param-reassign
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = true; // by default required = false
      if (unique) {
        prev[name].unique = true; // eslint-disable-line no-param-reassign
        if (!required) prev[name].sparse = true; // eslint-disable-line no-param-reassign
      }
      if (index) prev[name].index = true; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

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

      prev[name] = { type: array ? [Boolean] : Boolean }; // eslint-disable-line no-param-reassign
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = true; // by default required = false
      if (index) prev[name].index = true; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce(
      (prev, { array, config: { name: relationalThingName }, index, name, required, unique }) => {
        if (index && (embedded || file)) {
          throw new TypeError('Must not have an "index" field in an embedded OR file document!');
        }
        const obj: {
          ref: string,
          type: string,
          required?: boolean,
          sparse?: boolean,
          index?: boolean,
          unique?: boolean,
        } = {
          ref: relationalThingName,
          type: Schema.Types.ObjectId,
        };
        if (!required) obj.required = false; // by default required = true
        if (unique) {
          obj.unique = true; // eslint-disable-line no-param-reassign
          if (!required) obj.sparse = true; // eslint-disable-line no-param-reassign
        }
        if (index) obj.index = true;
        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
        return prev;
      },
      result,
    );
  }

  if (duplexFields) {
    if (embedded || file) {
      throw new TypeError('Must not have an "duplexField" in an embedded OR file document!');
    }
    duplexFields.reduce(
      (prev, { array, config: { name: duplexThingName }, index, name, required, unique }) => {
        // the same code as for relationalFields
        const obj: {
          ref: string,
          type: string,
          required?: boolean,
          sparse?: boolean,
          index?: boolean,
          unique?: boolean,
        } = {
          ref: duplexThingName,
          type: Schema.Types.ObjectId,
        };
        if (!required) obj.required = false; // by default required = true
        if (unique) {
          obj.unique = true; // eslint-disable-line no-param-reassign
          if (!required) obj.sparse = true; // eslint-disable-line no-param-reassign
        }
        if (index) obj.index = true;
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
      prev[name] = array ? [obj] : { type: new Schema(obj) };
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, { array, name, config }) => {
      const obj = composeThingSchemaProperties(config, enums);
      // eslint-disable-next-line no-param-reassign
      prev[name] = array ? [obj] : { type: new Schema(obj) };
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { array, name, required, geospatialType }) => {
      if (geospatialType === 'Point') {
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
        if (required) obj.type.required = true; // by default required = false

        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
      } else if (geospatialType === 'Polygon') {
        const obj: Object = {
          type: {
            type: String,
            enum: ['Polygon'],
          },
          coordinates: {
            type: [[[Number]]],
          },
        };
        if (required) obj.type.required = true; // by default required = false

        // eslint-disable-next-line no-param-reassign
        prev[name] = array ? [obj] : obj;
      } else {
        throw new TypeError(
          `Invalid value "${geospatialType}" of geospatial field geospatialType!`,
        );
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

      if (index && (embedded || file)) {
        throw new TypeError('Must not have an "index" field in an embedded OR file document!');
      }

      // eslint-disable-next-line no-param-reassign
      prev[name] = {
        enum: enumObject[enumName],
        type: array ? [String] : String,
      };
      // eslint-disable-next-line no-param-reassign
      if (required) prev[name].required = true; // by default required = false
      if (index) prev[name].index = true; // eslint-disable-line no-param-reassign
      if (defaultValue !== undefined) prev[name].default = defaultValue; // eslint-disable-line no-param-reassign
      return prev;
    }, result);
  }

  return result;
};

export default composeThingSchemaProperties;
