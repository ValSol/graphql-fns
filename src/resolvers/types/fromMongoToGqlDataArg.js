// @flow
import type { ThingConfig } from '../../flowTypes';

const { default: pointFromMongoToGql } = require('./pointFromMongoToGql');
const { default: polygonFromMongoToGql } = require('./polygonFromMongoToGql');

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
  const {
    embeddedFields,
    fileFields,
    relationalFields,
    duplexFields,
    geospatialFields,
  } = thingConfig;

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
    relationalFields.reduce((prev, { name, array }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        }
      }
      return prev;
    }, result);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { name, array }) => {
      if (data[name]) {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
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
