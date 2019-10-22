// @flow
import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';
import composeEmptyValues from './composeEmptyValues';

const coerceDataFromGql = (data: Object, thingConfig: ThingConfig, allFields?: boolean): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = Object.keys(data).reduce((prev, key) => {
    if (fieldsObject[key] === undefined) return prev;
    const {
      attributes: { array },
      kind,
    } = fieldsObject[key];
    if (kind === 'relationalFields' || kind === 'duplexFields') {
      if (data[key] === null) {
        prev[key] = ''; // eslint-disable-line no-param-reassign
      } else if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map(item => {
          if (item === null) return '';
          const { id } = item;
          return id === null ? '' : id;
        });
      } else {
        const { id } = data[key];
        prev[key] = id === null ? '' : id; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'dateTimeFields') {
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map(item => (item === null ? '' : item));
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key] === null ? '' : data[key];
      }
    } else if (fieldsObject[key].kind === 'geospatialFields') {
      const { geospatialType } = fieldsObject[key].attributes;
      if (geospatialType === 'Point') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map(item => {
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
          prev[key] = data[key].map(item =>
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
    } else if (fieldsObject[key].kind === 'embeddedFields') {
      const { config } = fieldsObject[key].attributes;
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map(item =>
          item === null ? composeEmptyValues(config) : coerceDataFromGql(item, config),
        );
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] =
          data[key] === null ? composeEmptyValues(config) : coerceDataFromGql(data[key], config);
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