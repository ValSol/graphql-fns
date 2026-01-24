import mongoose from 'mongoose';

import type { Enums, EntityConfig } from '../tsTypes';

type ThingSchemaProperty = {
  type: any | [any];
  default?: string;
  required?: boolean;
};
type ThingSchemaProperties = {
  [key: string]: ThingSchemaProperty;
};

const { Schema } = mongoose;

const composeThingSchemaProperties = (
  entityConfig: EntityConfig,
  enums: Enums,
  parentIndexedField = '',
): ThingSchemaProperties => {
  const {
    booleanFields = [],
    dateTimeFields = [],
    embeddedFields = [],
    enumFields = [],
    intFields = [],
    floatFields = [],
    geospatialFields = [],
    textFields = [],
    type: configType,
    name: entityName,
  } = entityConfig;

  const result: Record<string, any> = {};

  if (configType === 'tangible' && entityConfig.counter) {
    result.counter = {
      type: Number,
      unique: true,
      required: true,
    };
  }

  textFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
    if (defaultValue) {
      if (!array && Array.isArray(defaultValue)) {
        throw new TypeError('Expected not an array as default value');
      }

      if (array && !Array.isArray(defaultValue)) {
        throw new TypeError('Expected an array as default value');
      }
    }

    if (unique && configType !== 'tangible') {
      throw new TypeError(`Must not have an "unique" field in an "${configType}" document!`);
    }

    prev[name] = { type: array ? [String] : String };

    if (defaultValue !== undefined) prev[name].default = defaultValue;

    if (required) prev[name].required = true; // by default required = false

    if (unique) {
      prev[name].unique = true;

      if (!required) prev[name].sparse = true;
    }

    if (index && (configType === 'tangible' || parentIndexedField)) {
      prev[name].index = true;
    }

    return prev;
  }, result);

  dateTimeFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
    if (defaultValue) {
      if (!array && Array.isArray(defaultValue)) {
        throw new TypeError('Expected not an array as default value');
      }

      if (array && !Array.isArray(defaultValue)) {
        throw new TypeError('Expected an array as default value');
      }
    }

    if (unique && configType !== 'tangible') {
      throw new TypeError(`Must not have an "unique" field in an "${configType}" document!`);
    }

    prev[name] = { type: array ? [Date] : Date };

    if (defaultValue !== undefined) prev[name].default = defaultValue;

    if (required) prev[name].required = true; // by default required = false

    if (unique) {
      prev[name].unique = true;
      if (!required) prev[name].sparse = true;
    }

    if (index && (configType === 'tangible' || parentIndexedField)) {
      prev[name].index = true;
    }

    return prev;
  }, result);

  intFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
    if (defaultValue) {
      if (!array && Array.isArray(defaultValue)) {
        throw new TypeError('Expected not an array as default value');
      }
      if (array && !Array.isArray(defaultValue)) {
        throw new TypeError('Expected an array as default value');
      }
    }

    if (unique && configType !== 'tangible') {
      throw new TypeError(`Must not have an "unique" field in an "${configType}" document!`);
    }

    prev[name] = { type: array ? [Number] : Number };
    if (defaultValue !== undefined) prev[name].default = defaultValue;

    if (required) prev[name].required = true; // by default required = false

    if (unique) {
      prev[name].unique = true;
      if (!required) prev[name].sparse = true;
    }

    if (index && (configType === 'tangible' || parentIndexedField)) {
      prev[name].index = true;
    }

    return prev;
  }, result);

  floatFields.reduce((prev, { array, default: defaultValue, index, name, required, unique }) => {
    if (defaultValue) {
      if (!array && Array.isArray(defaultValue)) {
        throw new TypeError('Expected not an array as default value');
      }

      if (array && !Array.isArray(defaultValue)) {
        throw new TypeError('Expected an array as default value');
      }
    }

    if (unique && configType !== 'tangible') {
      throw new TypeError(`Must not have an "unique" field in an "${configType}" document!`);
    }

    prev[name] = { type: array ? [Number] : Number };

    if (defaultValue !== undefined) prev[name].default = defaultValue;

    if (required) prev[name].required = true; // by default required = false

    if (unique) {
      prev[name].unique = true;

      if (!required) prev[name].sparse = true;
    }

    if (index && (configType === 'tangible' || parentIndexedField)) {
      prev[name].index = true;
    }

    return prev;
  }, result);

  booleanFields.reduce((prev, { array, default: defaultValue, index, name, required }) => {
    if (defaultValue) {
      if (!array && Array.isArray(defaultValue)) {
        throw new TypeError('Expected not an array as default value');
      }

      if (array && !Array.isArray(defaultValue)) {
        throw new TypeError('Expected an array as default value');
      }
    }

    prev[name] = { type: array ? [Boolean] : Boolean };

    if (defaultValue !== undefined) prev[name].default = defaultValue;

    if (required) prev[name].required = true; // by default required = false

    if (index && (configType === 'tangible' || parentIndexedField)) {
      prev[name].index = true;
    }

    return prev;
  }, result);

  if (configType === 'tangible') {
    const { duplexFields = [], relationalFields = [], filterFields = [] } = entityConfig;

    relationalFields
      .filter(({ parent }) => !parent)
      .reduce((prev, { array, config: { name: relationalEntityName }, name, required, unique }) => {
        if (configType !== 'tangible') {
          throw new TypeError(
            `Must not have an "relational" field in an "${configType}" document!`,
          );
        }

        const obj: {
          ref: string;
          type: string;
          required?: boolean;
          sparse?: boolean;
          index?: boolean;
          unique?: boolean;
        } = {
          ref: relationalEntityName,
          type: 'ObjectId',
        };
        if (!required) obj.required = false; // by default required = true
        if (unique) {
          obj.unique = true;
          if (!required) obj.sparse = true;
        }
        obj.index = true; // always create index

        prev[name] = array ? [obj] : obj;
        return prev;
      }, result);

    duplexFields.reduce(
      (prev, { array, config: { name: duplexThingName }, index, name, required, unique }) => {
        if (configType !== 'tangible') {
          throw new TypeError(`Must not have an "duplexField" in an "${configType}" document!`);
        }

        // the same code as for relationalFields
        const obj: {
          ref: string;
          type: string;
          required?: boolean;
          sparse?: boolean;
          index?: boolean;
          unique?: boolean;
        } = {
          ref: duplexThingName,
          type: 'ObjectId',
        };

        if (!required) obj.required = false; // by default required = true

        if (unique) {
          obj.unique = true;
          if (!required) obj.sparse = true;
        }

        if (index) obj.index = true;

        prev[name] = array ? [obj] : obj;

        return prev;
      },
      result,
    );

    filterFields.reduce((prev, { name, required }) => {
      prev[name] = { type: String };

      if (required) prev[name].required = true;

      return prev;
    }, result);
  }

  embeddedFields.reduce((prev, { array, name, config, index }) => {
    const obj = composeThingSchemaProperties(config, enums, index ? `${entityName}.${name}` : '');

    prev[name] = array ? [obj] : { type: new Schema(obj) };

    return prev;
  }, result);

  geospatialFields.reduce((prev, { array, name, required, geospatialType }) => {
    if (geospatialType === 'Point') {
      const obj: any = {
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

      prev[name] = array ? [obj] : obj;
    } else if (geospatialType === 'Polygon') {
      const obj: any = {
        type: {
          type: String,
          enum: ['Polygon'],
        },
        coordinates: {
          type: [[[Number]]],
        },
      };

      if (required) obj.type.required = true; // by default required = false

      prev[name] = array ? [obj] : obj;
    } else if (geospatialType === 'MultiPolygon') {
      const obj: any = {
        type: {
          type: String,
          enum: ['MultiPolygon'],
        },
        coordinates: {
          type: [[[[Number]]]],
        },
      };

      if (required) obj.type.required = true; // by default required = false

      prev[name] = array ? [obj] : obj;
    } else {
      throw new TypeError(`Invalid value "${geospatialType}" of geospatial field geospatialType!`);
    }
    return prev;
  }, result);

  enumFields.reduce((prev, { array, default: defaultValue, index, name, required, enumName }) => {
    if (defaultValue) {
      if (!array && !(typeof defaultValue === 'string')) {
        throw new TypeError('Expected a string as default value');
      }

      if (array && !Array.isArray(defaultValue)) {
        throw new TypeError('Expected an array as default value');
      }
    }

    prev[name] = {
      enum: enums[enumName],
      type: array ? [String] : String,
    };

    if (required) prev[name].required = true; // by default required = false

    if (index && (configType === 'tangible' || parentIndexedField)) {
      prev[name].index = true;
    }

    if (defaultValue !== undefined) prev[name].default = defaultValue;

    return prev;
  }, result);

  return result;
};

export default composeThingSchemaProperties;
