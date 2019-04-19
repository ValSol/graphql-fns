// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingArrayResolver = require('./createThingArrayResolver');
const createThingScalarResolver = require('./createThingScalarResolver');

type ThingResolver = { [key: string]: Function };

const composeThingResolvers = (thingConfig: ThingConfig): ThingResolver => {
  const { duplexFields, relationalFields } = thingConfig;

  if (!relationalFields && !duplexFields)
    throw new TypeError('Expected an array as a value of the relationalFields key of thingConfig');

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

  return resolvers;
};

module.exports = composeThingResolvers;
