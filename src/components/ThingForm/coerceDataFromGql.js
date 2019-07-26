// @flow
import type { ThingConfig } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';
import composeEmptyValues from './composeEmptyValues';

const coerceDataFromGql = (data: Object, thingConfig: ThingConfig): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return Object.keys(data).reduce((prev, key) => {
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
        prev[key] = data[key].map(item => (item === null ? '' : item.slice(0, 19)));
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key] === null ? '' : data[key].slice(0, 19);
      }
    } else if (fieldsObject[key].kind === 'geospatialFields') {
      const { geospatialType } = fieldsObject[key].attributes;
      if (geospatialType === 'Point') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map(item => {
            if (!item) {
              return { longitude: '', latitude: '' };
            }
            const { longitude, latitude } = item;
            return { longitude, latitude };
          });
        } else if (!data[key]) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = { longitude: '', latitude: '' };
        } else {
          const { longitude, latitude } = data[key];
          prev[key] = { longitude, latitude }; // eslint-disable-line no-param-reassign
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
};

export default coerceDataFromGql;
