// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingArrayResolver = require('./createThingArrayResolver');
const createThingScalarResolver = require('./createThingScalarResolver');

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
    geospatialFields.reduce((prev, { name }) => {
      const resolver = () => {
        // const { fieldName } = info;
        // const rawValue = parent[fieldName];

        return null;
        // return rawValue;
      };
      // eslint-disable-next-line no-param-reassign
      prev[name] = resolver;
      return prev;
    }, resolvers);
  }

  return resolvers;
};

module.exports = composeThingResolvers;
