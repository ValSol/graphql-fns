// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';
import createThingArrayResolver from '../createThingArrayResolver';
import createThingScalarResolver from '../createThingScalarResolver';
import fieldArrayResolver from '../fieldArrayResolver';
import pointFromMongoToGql from '../pointFromMongoToGql';
import polygonFromMongoToGql from '../polygonFromMongoToGql';

type ThingResolver = { [key: string]: Function };

type Args = { slice: { begin?: number, end?: number } };
type Context = { mongooseConn: Object };

const composeThingResolvers = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): ThingResolver => {
  const { duplexFields, geospatialFields, relationalFields } = thingConfig;
  const fieldsObject = composeFieldsObject(thingConfig);

  const resolvers = {};

  Object.keys(fieldsObject).forEach((fieldName) => {
    const {
      attributes: { array },
      kind,
    } = fieldsObject[fieldName];
    if (kind === 'relationalFields' || kind === 'duplexFields' || kind === 'geospatialFields') {
      return;
    }

    if (array) resolvers[fieldName] = fieldArrayResolver;
  });

  if (relationalFields) {
    relationalFields.reduce((prev, { array, name, config }) => {
      if (array) {
        const resolver = createThingArrayResolver(config, generalConfig, serversideConfig);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      } else {
        const resolver = createThingScalarResolver(config, generalConfig, serversideConfig);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      }
      return prev;
    }, resolvers);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { array, name, config }) => {
      if (array) {
        const resolver = createThingArrayResolver(config, generalConfig, serversideConfig);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      } else {
        const resolver = createThingScalarResolver(config, generalConfig, serversideConfig);
        // eslint-disable-next-line no-param-reassign
        prev[name] = resolver;
      }
      return prev;
    }, resolvers);
  }

  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, array, geospatialType }) => {
      const resolver = (parent: Object, args: Args, context: Context, info: Object): Object => {
        if (array) {
          const values = fieldArrayResolver(parent, args, context, info);
          if (!values || !values.length) return [];

          if (geospatialType === 'Point') {
            return values.map((value) => pointFromMongoToGql(value));
          }

          if (geospatialType === 'Polygon') {
            return values.map((value) => polygonFromMongoToGql(value));
          }

          throw new TypeError(
            `Invalid geospatialType value "${name}" of geospatial mongodb field!`,
          );
        }

        const value = parent[name];
        if (!value || !value.type) return null;

        if (geospatialType === 'Point') return pointFromMongoToGql(value);

        if (geospatialType === 'Polygon') return polygonFromMongoToGql(value);

        throw new TypeError(`Invalid geospatialType value "${name}" of geospatial mongodb field!`);
      };
      // eslint-disable-next-line no-param-reassign
      prev[name] = resolver;
      return prev;
    }, resolvers);
  }

  return resolvers;
};

export default composeThingResolvers;
