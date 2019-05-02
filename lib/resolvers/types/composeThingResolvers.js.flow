// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingArrayResolver = require('./createThingArrayResolver');
const createThingScalarResolver = require('./createThingScalarResolver');
const pointFromMongoToGql = require('./pointFromMongoToGql');
const polygonFromMongoToGql = require('./polygonFromMongoToGql');

type ThingResolver = { [key: string]: Function };

const composeThingResolvers = (thingConfig: ThingConfig): ThingResolver => {
  const { duplexFields, geospatialFields, relationalFields } = thingConfig;

  const resolvers = {};

  if (relationalFields) {
    relationalFields.reduce((prev, { array, name, config }) => {
      if (array) {
        const resolver = createThingArrayResolver(config);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      } else {
        const resolver = createThingScalarResolver(config);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      }
      return prev;
    }, resolvers);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { array, name, config }) => {
      if (array) {
        const resolver = createThingArrayResolver(config);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      } else {
        const resolver = createThingScalarResolver(config);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      }
      return prev;
    }, resolvers);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, array, type }) => {
      const resolver = (parent: Object): Object => {
        if (array) {
          const values = parent[name];
          if (!values || !values.length) return [];
          console.log('*************************************');
          console.log('values =', JSON.stringify(values, null, ' '));
          console.log('*************************************');
          if (type === 'Point') {
            return values.map(value => pointFromMongoToGql(value));
          }
          if (type === 'Polygon') {
            return values.map(value => polygonFromMongoToGql(value));
          }
          throw new TypeError(`Invalid type value "${name}" of geospatial mongodb field!`);
        }

        const value = parent[name];
        if (!value || !value.type) return null;

        if (type === 'Point') return pointFromMongoToGql(value);

        if (type === 'Polygon') return polygonFromMongoToGql(value);

        throw new TypeError(`Invalid type value "${name}" of geospatial mongodb field!`);
      };
      // eslint-disable-next-line no-param-reassign
      prev[name] = resolver;
      return prev;
    }, resolvers);
  }

  return resolvers;
};

module.exports = composeThingResolvers;
