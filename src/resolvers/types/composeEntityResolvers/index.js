// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';
import createEntityArrayResolver from '../createEntityArrayResolver';
import createEntityConnectionResolver from '../createEntityConnectionResolver';
import createEntityScalarResolver from '../createEntityScalarResolver';
import fieldArrayResolver from '../fieldArrayResolver';
import pointFromMongoToGql from '../pointFromMongoToGql';
import polygonFromMongoToGql from '../polygonFromMongoToGql';

type EntityResolver = { [key: string]: Function };

type Args = { slice: { begin?: number, end?: number } };

const composeEntityResolvers = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): EntityResolver => {
  const { duplexFields, geospatialFields, relationalFields } = entityConfig;
  const fieldsObject = composeFieldsObject(entityConfig);

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
        const resolver = createEntityArrayResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }

        const resolver2 = createEntityConnectionResolver(config, generalConfig, serversideConfig);

        if (resolver2) {
          prev[`${name}ThroughConnection`] = resolver2; // eslint-disable-line no-param-reassign
        }
      } else {
        const resolver = createEntityScalarResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }
      }
      return prev;
    }, resolvers);
  }

  if (duplexFields) {
    duplexFields.reduce((prev, { array, name, config }) => {
      if (array) {
        const resolver = createEntityArrayResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }

        const resolver2 = createEntityConnectionResolver(config, generalConfig, serversideConfig);

        if (resolver2) {
          prev[`${name}ThroughConnection`] = resolver2; // eslint-disable-line no-param-reassign
        }
      } else {
        const resolver = createEntityScalarResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }
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

export default composeEntityResolvers;
