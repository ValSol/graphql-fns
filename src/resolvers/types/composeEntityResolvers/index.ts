import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  TangibleEntityConfig,
} from '../../../tsTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';
import createEntityArrayResolver from '../createEntityArrayResolver';
import createEntityOppositeRelationArrayResolver from '../createEntityOppositeRelationArrayResolver';
import createEntityOppositeRelationConnectionResolver from '../createEntityOppositeRelationConnectionResolver';
import createEntityConnectionResolver from '../createEntityConnectionResolver';
import createEntityScalarResolver from '../createEntityScalarResolver';
import fieldArrayResolver from '../fieldArrayResolver';
import pointFromMongoToGql from '../pointFromMongoToGql';
import polygonFromMongoToGql from '../polygonFromMongoToGql';
import fieldArrayThroughConnectionResolver from '../fieldArrayThroughConnectionResolver';

type EntityResolver = {
  [key: string]: any;
};

type Args = {
  slice: {
    begin?: number;
    end?: number;
  };
};

const composeEntityResolvers = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): EntityResolver => {
  const {
    embeddedFields = [],
    geospatialFields = [],
    fileFields = [],
    type: entityType,
  } = entityConfig;
  const fieldsObject = composeFieldsObject(entityConfig);

  const resolvers: Record<string, any> = {};

  Object.keys(fieldsObject).forEach((fieldName) => {
    const { array, type: fieldType } = fieldsObject[fieldName];
    if (
      fieldType === 'relationalFields' ||
      fieldType === 'duplexFields' ||
      fieldType === 'geospatialFields'
    ) {
      return;
    }

    if (array) resolvers[fieldName] = fieldArrayResolver;
  });

  [...embeddedFields, ...fileFields].forEach((field) => {
    const { array, name } = field;

    if (array) {
      resolvers[`${name}ThroughConnection`] = fieldArrayThroughConnectionResolver;
    }
  });

  if (entityType === 'tangible') {
    const { duplexFields = [], relationalFields = [] } = entityConfig as TangibleEntityConfig;

    const { originalRelationalFields, parentRelationalFields } = relationalFields.reduce(
      (prev, item) => {
        if (item.parent) {
          prev.parentRelationalFields.push(item);
        } else {
          prev.originalRelationalFields.push(item);
        }

        return prev;
      },
      { originalRelationalFields: [], parentRelationalFields: [] },
    );

    parentRelationalFields.reduce((prev, { name, config }) => {
      const resolver = createEntityOppositeRelationArrayResolver(
        config,
        generalConfig,
        serversideConfig,
      );

      if (resolver) {
        prev[name] = resolver; // eslint-disable-line no-param-reassign
      }

      const resolver2 = createEntityOppositeRelationConnectionResolver(
        config,
        generalConfig,
        serversideConfig,
      );

      if (resolver2) {
        prev[`${name}ThroughConnection`] = resolver2; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, resolvers);

    [...originalRelationalFields, ...duplexFields].reduce((prev, { array, name, config }) => {
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
      const resolver = (parent: any, args: Args, context: Context, info: any): any => {
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
