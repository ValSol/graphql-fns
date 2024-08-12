import type { EmbeddedField, EntityConfig, GeospatialField } from '../tsTypes';

import composeFieldsObject from './composeFieldsObject';
import composeEmptyValues from './composeEmptyValues';

const coerceDataFromGql = (
  data: any,
  entityConfig: EntityConfig,
  allFields?: boolean,
  // set ON if use for creation JSON export file
  forExport?: boolean,
): any => {
  const fieldsObject = composeFieldsObject(entityConfig);

  const result = Object.keys(data).reduce<Record<string, any>>((prev, key) => {
    if (fieldsObject[key] === undefined || (forExport && data[key] === null)) return prev;
    const { array, type: fieldType } = fieldsObject[key];
    if (fieldType === 'relationalFields' || fieldType === 'duplexFields') {
      if (data[key] === null) {
        prev[key] = ''; // eslint-disable-line no-param-reassign
      } else if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map((item) => {
          if (item === null) return '';
          const { id } = item;
          return id === null ? '' : id;
        });
      } else {
        const { id } = data[key];
        prev[key] = id === null ? '' : id; // eslint-disable-line no-param-reassign
      }
    } else if (fieldType === 'dateTimeFields') {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
      // if (array) {
      //   // eslint-disable-next-line no-param-reassign
      //   prev[key] = data[key].map((item) => (item === null ? '' : item));
      // } else {
      //   // eslint-disable-next-line no-param-reassign
      //   prev[key] = data[key] === null ? '' : data[key];
      // }
    } else if (fieldsObject[key].type === 'geospatialFields') {
      const { geospatialType } = fieldsObject[key] as GeospatialField;
      if (geospatialType === 'Point') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map((item) => {
            if (!item) {
              return { lng: '', lat: '' };
            }
            const { lng, lat } = item;
            return { lng, lat };
          });
        } else if (!data[key]) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = { lng: '', lat: '' };
        } else {
          const { lng, lat } = data[key];
          prev[key] = { lng, lat }; // eslint-disable-line no-param-reassign
        }
      } else if (geospatialType === 'Polygon') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map((item) =>
            item === null
              ? {
                  externalRing: {
                    ring: [],
                  },
                  internalRings: [],
                }
              : item,
          );
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[key] =
            data[key] === null
              ? {
                  externalRing: {
                    ring: [],
                  },
                  internalRings: [],
                }
              : data[key];
        }
      } else {
        throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${key}"!`);
      }
    } else if (fieldsObject[key].type === 'embeddedFields') {
      const { config } = fieldsObject[key] as EmbeddedField;
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map((item) =>
          item === null ? composeEmptyValues(config) : coerceDataFromGql(item, config, allFields),
        );
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] =
          data[key] === null
            ? composeEmptyValues(config)
            : coerceDataFromGql(data[key], config, allFields);
      }
    } else {
      prev[key] = data[key] === null ? '' : data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
  if (allFields) {
    if (data.id) result.id = data.id;
    if (data.createdAt) result.createdAt = data.createdAt;
    if (data.updatedAt) result.updatedAt = data.updatedAt;
  }

  return result;
};

export default coerceDataFromGql;
