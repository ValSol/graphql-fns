// @flow

import { Types } from 'mongoose';

import type { ThingConfig } from '../../../flowTypes';

const { default: pointFromMongoToGql } = require('../pointFromMongoToGql');
const { default: polygonFromMongoToGql } = require('../polygonFromMongoToGql');

const { ObjectId } = Types;

const geospatialFromMongToGql = (item) => {
  const { type } = item;
  switch (type) {
    case 'Point':
      return pointFromMongoToGql(item);

    case 'Polygon':
      return polygonFromMongoToGql(item);

    default:
      throw new TypeError(`Incorrect geospatial field type "${type}"!`);
  }
};

const fromMongoToGqlDataArg = (data: Object, thingConfig: ThingConfig): Object => {
  const { embeddedFields, fileFields, relationalFields, duplexFields, geospatialFields } =
    thingConfig;

  const { id, ...result } = data;

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data[name].map((item) => fromMongoToGqlDataArg(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = fromMongoToGqlDataArg(data[name], config);
        }
      }
      return prev;
    }, result);
  }

  if (fileFields) {
    fileFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data[name].map((item) => fromMongoToGqlDataArg(item, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = fromMongoToGqlDataArg(data[name], config);
        }
      }
      return prev;
    }, result);
  }

  if (relationalFields) {
    relationalFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          if (!data[name].length) {
            // eslint-disable-next-line no-param-reassign
            prev[name] = { connect: [] };
          } else {
            const { connect, create, createPositions } = data[name].reduce(
              (prev2, item, i) => {
                if (item instanceof ObjectId || typeof item === 'string') {
                  prev2.connect.push(item);
                } else {
                  prev2.create.push(fromMongoToGqlDataArg(item, config));
                  prev2.createPositions.push(i);
                }
                return prev2;
              },
              { connect: [], create: [], createPositions: [] },
            );

            const result2 = {};
            if (connect.length) {
              result2.connect = connect;
            }

            if (create.length) {
              result2.create = create;
            }

            if (result2.connect && result2.create) {
              result2.createPositions = createPositions;
            }

            prev[name] = result2; // eslint-disable-line no-param-reassign
          }
        } else if (data[name] instanceof ObjectId || typeof data[name] === 'string') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { create: fromMongoToGqlDataArg(data[name], config) };
        }
      }
      return prev;
    }, result);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          if (!data[name].length) {
            // eslint-disable-next-line no-param-reassign
            prev[name] = { connect: [] };
          } else {
            const { connect, create, createPositions } = data[name].reduce(
              (prev2, item, i) => {
                if (item instanceof ObjectId || typeof item === 'string') {
                  prev2.connect.push(item);
                } else {
                  prev2.create.push(fromMongoToGqlDataArg(item, config));
                  prev2.createPositions.push(i);
                }
                return prev2;
              },
              { connect: [], create: [], createPositions: [] },
            );

            const result2 = {};
            if (connect.length) {
              result2.connect = connect;
            }

            if (create.length) {
              result2.create = create;
            }

            if (result2.connect && result2.create) {
              result2.createPositions = createPositions;
            }

            prev[name] = result2; // eslint-disable-line no-param-reassign
          }
        } else if (data[name] instanceof ObjectId || typeof data[name] === 'string') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { create: fromMongoToGqlDataArg(data[name], config) };
        }
      }
      return prev;
    }, result);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, array }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = data[name].map((item) => geospatialFromMongToGql(item));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = geospatialFromMongToGql(data[name]);
        }
      }
      return prev;
    }, result);
  }

  return result;
};

module.exports = fromMongoToGqlDataArg;
