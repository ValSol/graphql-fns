// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingArrayResolver = require('./createThingArrayResolver');
const createThingScalarResolver = require('./createThingScalarResolver');

type ThingResolver = { [key: string]: Function };

const composeThingResolvers = (thingConfig: ThingConfig): ThingResolver => {
  const { embeddedFields, relationalFields } = thingConfig;

  if (!relationalFields)
    throw new TypeError('Expected an array as a value of the relationalFields key of thingConfig');

  const resolvers = relationalFields.reduce((prev, { array, name, config }) => {
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
  }, {});

  if (embeddedFields) {
    embeddedFields.reduce((prev, { name, config: { relationalFields: relationalFields2 } }) => {
      const childeren = {};
      if (relationalFields2) {
        relationalFields2.reduce((prev2, { array, name: name2, config }) => {
          if (array) {
            const resolver = createThingArrayResolver(config);
            // eslint-disable-next-line no-param-reassign
            prev2[name2] = resolver;
          } else {
            // const resolver = createThingScalarResolver(config);
            // prev2[name2] = resolver;
            // eslint-disable-next-line no-param-reassign
            prev2[name2] = () => {
              return { id: '5cb4d6130490ee40854416b4', name: 'VVaassyyaa' };
            };
          }
          return prev2;
        }, childeren);
      }
      // eslint-disable-next-line no-param-reassign
      if (Object.keys(childeren).length) prev[name] = childeren;
      return prev;
    }, resolvers);
  }

  return resolvers;
};

module.exports = composeThingResolvers;
