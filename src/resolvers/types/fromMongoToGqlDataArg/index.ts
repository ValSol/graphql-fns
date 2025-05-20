import type {
  DataObject,
  EntityConfig,
  GraphqlObject,
  MongodbGeospatialMultiPolygon,
  MongodbGeospatialPoint,
  MongodbGeospatialPolygon,
} from '../../../tsTypes';

import multiPolygonFromMongoToGql from '../multiPolygonFromMongoToGql';
import pointFromMongoToGql from '../pointFromMongoToGql';
import polygonFromMongoToGql from '../polygonFromMongoToGql';

const geospatialFromMongToGql = (item: DataObject) => {
  const { type: geoType } = item;
  switch (geoType) {
    case 'Point':
      return pointFromMongoToGql(item as MongodbGeospatialPoint);

    case 'Polygon':
      return polygonFromMongoToGql(item as MongodbGeospatialPolygon);

    case 'MultiPolygon':
      return multiPolygonFromMongoToGql(item as MongodbGeospatialMultiPolygon);

    default:
      throw new TypeError(`Incorrect geospatial field type "${geoType}"!`);
  }
};

const fromMongoToGqlDataArg = (data: DataObject, entityConfig: EntityConfig): GraphqlObject => {
  const { embeddedFields = [], geospatialFields = [], type: entityType } = entityConfig;

  const { id, ...result } = data;

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

  if (entityType === 'tangible') {
    const { relationalFields = [], duplexFields = [], filterFields = [] } = entityConfig;

    relationalFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          if (!data[name].length) {
            // eslint-disable-next-line no-param-reassign
            prev[name] = { connect: [] };
          } else {
            const { connect, create, createPositions } = data[name].reduce(
              (prev2, item, i) => {
                if (typeof item === 'string' || item.constructor.name === 'ObjectId') {
                  prev2.connect.push(item);
                } else {
                  prev2.create.push(fromMongoToGqlDataArg(item, config));
                  prev2.createPositions.push(i);
                }
                return prev2;
              },
              { connect: [], create: [], createPositions: [] },
            );

            const result2: Record<string, any> = {};
            if (connect.length) {
              result2.connect = connect;
            }

            if (create.length) {
              result2.create = create;
            }

            if (result2.connect && result2.create) {
              result2.createPositions = createPositions;
            }

            prev[name] = result2; // eslint-disable-line no-param-reassign
          }
        } else if (typeof data[name] === 'string' || data[name].constructor.name === 'ObjectId') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { create: fromMongoToGqlDataArg(data[name], config) };
        }
      } else if (data[name] === null) {
        prev[name] = { connect: null };
      }

      return prev;
    }, result);

    duplexFields.reduce((prev, { name, array, config }) => {
      if (data[name]) {
        if (array) {
          if (!data[name].length) {
            // eslint-disable-next-line no-param-reassign
            prev[name] = { connect: [] };
          } else {
            const { connect, create, createPositions } = data[name].reduce(
              (prev2, item, i) => {
                if (typeof item === 'string' || item.constructor.name === 'ObjectId') {
                  prev2.connect.push(item);
                } else {
                  prev2.create.push(fromMongoToGqlDataArg(item, config));
                  prev2.createPositions.push(i);
                }
                return prev2;
              },
              { connect: [], create: [], createPositions: [] },
            );

            const result2: Record<string, any> = {};
            if (connect.length) {
              result2.connect = connect;
            }

            if (create.length) {
              result2.create = create;
            }

            if (result2.connect && result2.create) {
              result2.createPositions = createPositions;
            }

            prev[name] = result2; // eslint-disable-line no-param-reassign
          }
        } else if (typeof data[name] === 'string' || data[name].constructor.name === 'ObjectId') {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { connect: data[name] };
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[name] = { create: fromMongoToGqlDataArg(data[name], config) };
        }
      } else if (data[name] === null) {
        prev[name] = { connect: null };
      }

      return prev;
    }, result);

    filterFields.reduce((prev, { name }) => {
      if (data[name]) {
        prev[name] = JSON.parse(data[name]);
      } else {
        prev[name] = null;
      }

      return prev;
    }, result);
  }

  return result;
};

export default fromMongoToGqlDataArg;
