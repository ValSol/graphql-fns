// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingArrayResolver = require('./createThingScalarResolver');
const createThingScalarResolver = require('./createThingScalarResolver');

type ThingConfigsObject = { [key: string]: ThingConfig };
type ThingResolver = { [key: string]: Function };

const composeThingResolvers = (
  thingConfig: ThingConfig,
  thingConfigsObject: ThingConfigsObject,
): ThingResolver => {
  const { relationalFields } = thingConfig;

  if (!relationalFields)
    throw new TypeError('Expected an array as a value of the relationalFields key of thingConfig');

  const resolvers = relationalFields.reduce((prev, { array, name, thingName }) => {
    if (array) {
      const resolver = createThingArrayResolver(thingConfigsObject[thingName]);
      // eslint-disable-next-line no-param-reassign
      prev[name] = resolver;
    } else {
      const resolver = createThingScalarResolver(thingConfigsObject[thingName]);
      // eslint-disable-next-line no-param-reassign
      prev[name] = resolver;
    }
    return prev;
  }, {});

  return resolvers;
};

module.exports = composeThingResolvers;
