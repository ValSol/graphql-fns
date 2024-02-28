import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  TangibleEntityConfig,
  ScalarCalculatedFilterField,
  ArrayCalculatedFilterField,
} from '../../../tsTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';
import createEntityArrayResolver from '../createEntityArrayResolver';
import createEntityCountResolver from '../createEntityCountResolver';
import createEntityDistinctValuesResolver from '../createEntityDistinctValuesResolver';
import createEntityGetOrCreateResolver from '../createEntityGetOrCreateResolver';
import createEntityOppositeRelationArrayResolver from '../createEntityOppositeRelationArrayResolver';
import createEntityOppositeRelationCountResolver from '../createEntityOppositeRelationCountResolver';
import createEntityOppositeRelationDistinctValuesResolver from '../createEntityOppositeRelationDistinctValuesResolver';
import createEntityOppositeRelationConnectionResolver from '../createEntityOppositeRelationConnectionResolver';
import createEntityConnectionResolver from '../createEntityConnectionResolver';
import createEntityScalarResolver from '../createEntityScalarResolver';
import fieldArrayCountResolver from '../fieldArrayCountResolver';
import fieldArrayResolver from '../fieldArrayResolver';
import pointFromMongoToGql from '../pointFromMongoToGql';
import polygonFromMongoToGql from '../polygonFromMongoToGql';
import fieldArrayThroughConnectionResolver from '../fieldArrayThroughConnectionResolver';
import createEntityFilterArrayResolver from '../createEntityFilterArrayResolver';
import createEntityFilterConnectionResolver from '../createEntityFilterConnectionResolver';
import createEntityFilterCountResolver from '../createEntityFilterCountResolver';
import createEntityFilterDistinctValuesResolver from '../createEntityFilterDistinctValuesResolver';
import createEntityFilterScalarResolver from '../createEntityFilterScalarResolver';
import fieldFilterStringifiedResolver from '../fieldFilterStringifiedResolver';

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
    embeddedFields: preEmbeddedFields = [],
    geospatialFields: preGeospatialFields = [],
    fileFields: preFileFields = [],
    type: entityType,
  } = entityConfig;
  const fieldsObject = composeFieldsObject(entityConfig);

  const resolvers: Record<string, any> = {};

  // repack "embeddedFields", "geospatialFields", "fileFields" in the new arrays...
  // ...to can mix up calculated fields if need
  const embeddedFields = [...preEmbeddedFields];
  const geospatialFields = [...preGeospatialFields];
  const fileFields = [...preFileFields];

  if (entityType === 'tangible') {
    const { calculatedFields = [] } = entityConfig;

    calculatedFields.forEach((field) => {
      const { calculatedType, array } = field;

      if (calculatedType === 'embeddedFields') {
        const updatedField = array ? { ...field, variants: 'plain' } : field;
        embeddedFields.push(updatedField as any);
      }

      if (calculatedType === 'fileFields') {
        const updatedField = array ? { ...field, variants: 'plain' } : field;
        fileFields.push(updatedField as any);
      }

      if (calculatedType === 'geospatialFields') {
        geospatialFields.push(field as any);
      }
    });
  }

  Object.keys(fieldsObject).forEach((fieldName) => {
    const { array, type: fieldType } = fieldsObject[fieldName];
    if (
      fieldType === 'relationalFields' ||
      fieldType === 'duplexFields' ||
      fieldType === 'filterFields' ||
      fieldType === 'geospatialFields' ||
      fieldType === 'embeddedFields' ||
      fieldType === 'fileFields'
    ) {
      return;
    }

    if (fieldType === 'calculatedFields') {
      const { calculatedType } = fieldsObject[fieldName] as any;

      if (calculatedType === 'filterFields') {
        return;
      }
    }

    if (array) resolvers[fieldName] = fieldArrayResolver;
  });

  [...embeddedFields, ...fileFields].forEach((field) => {
    const { array, name } = field;

    if (array) {
      const { variants } = field;

      if (variants.includes('plain')) {
        resolvers[name] = fieldArrayResolver;
      }

      if (variants.includes('connection')) {
        resolvers[`${name}ThroughConnection`] = fieldArrayThroughConnectionResolver;
      }

      if (variants.includes('count')) {
        resolvers[`${name}Count`] = fieldArrayCountResolver;
      }
    }
  });

  if (entityType === 'tangible') {
    const {
      duplexFields = [],
      relationalFields = [],
      filterFields = [],
      calculatedFields = [],
    } = entityConfig as TangibleEntityConfig;

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
        prev[name] = resolver;
      }

      const resolver2 = createEntityOppositeRelationConnectionResolver(
        config,
        generalConfig,
        serversideConfig,
      );

      if (resolver2) {
        prev[`${name}ThroughConnection`] = resolver2;
      }

      const resolver3 = createEntityOppositeRelationCountResolver(
        config,
        generalConfig,
        serversideConfig,
      );

      if (resolver3) {
        prev[`${name}Count`] = resolver3;
      }

      const resolver4 = createEntityOppositeRelationDistinctValuesResolver(
        config,
        generalConfig,
        serversideConfig,
      );

      if (resolver4) {
        prev[`${name}DistinctValues`] = resolver4;
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

        const resolver3 = createEntityCountResolver(config, generalConfig, serversideConfig);

        if (resolver3) {
          prev[`${name}Count`] = resolver3; // eslint-disable-line no-param-reassign
        }

        const resolver4 = createEntityDistinctValuesResolver(
          config,
          generalConfig,
          serversideConfig,
        );

        if (resolver4) {
          prev[`${name}DistinctValues`] = resolver4; // eslint-disable-line no-param-reassign
        }
      } else {
        const resolver = createEntityScalarResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }
      }
      return prev;
    }, resolvers);

    duplexFields.reduce((prev, { array, name, oppositeName, config, required }) => {
      if (array || required) {
        return prev;
      }

      const { array: oppositeArray } = composeFieldsObject(config)[oppositeName];

      if (oppositeArray) {
        return prev;
      }

      const resolver = createEntityGetOrCreateResolver(config, generalConfig, serversideConfig);

      if (resolver) {
        prev[`${name}GetOrCreate`] = resolver;
      }

      return prev;
    }, resolvers);

    [
      ...filterFields.filter(({ variants }) => variants.includes('plain')),
      ...(calculatedFields.filter(({ calculatedType }) => calculatedType === 'filterFields') as
        | ArrayCalculatedFilterField[]
        | ScalarCalculatedFilterField[]),
    ].reduce((prev, { array, name, config }) => {
      if (array) {
        const resolver = createEntityFilterArrayResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }

        const resolver2 = createEntityFilterConnectionResolver(
          config,
          generalConfig,
          serversideConfig,
        );

        if (resolver2) {
          prev[`${name}ThroughConnection`] = resolver2;
        }

        const resolver3 = createEntityFilterCountResolver(config, generalConfig, serversideConfig);

        if (resolver3) {
          prev[`${name}Count`] = resolver3; // eslint-disable-line no-param-reassign
        }

        const resolver4 = createEntityFilterDistinctValuesResolver(
          config,
          generalConfig,
          serversideConfig,
        );

        if (resolver4) {
          prev[`${name}DistinctValues`] = resolver4; // eslint-disable-line no-param-reassign
        }
      } else {
        const resolver = createEntityFilterScalarResolver(config, generalConfig, serversideConfig);

        if (resolver) {
          prev[name] = resolver; // eslint-disable-line no-param-reassign
        }
      }

      return prev;
    }, resolvers);

    filterFields
      .filter(({ variants }) => variants.includes('stringified'))
      .reduce((prev, { name }) => {
        prev[`${name}Stringified`] = fieldFilterStringifiedResolver;

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
