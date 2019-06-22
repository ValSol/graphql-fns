// @flow
import deepEqual from 'fast-deep-equal';

import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';

const isNotDate = date =>
  new Date(date).toString() === 'Invalid Date' || Number.isNaN(new Date(date));

const coerceDataToGql = (
  data: Object,
  prevData: null | Object,
  thingConfig: ThingConfig,
): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return Object.keys(data).reduce((prev, key) => {
    const { array, config, geospatialType, kind } = fieldsObject[key];

    if (prevData && deepEqual(data[key], prevData[key])) {
      return prev;
    }

    if (kind === 'embeddedFields') {
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map(item => coerceDataToGql(item, null, config));
      } else {
        prev[key] = coerceDataToGql(data[key], null, config); // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'relationalFields' || kind === 'duplexFields') {
      if (array) {
        prev[key] = { connect: data[key] || [] }; // eslint-disable-line no-param-reassign
      } else {
        prev[key] = { connect: data[key] || null }; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'enumFields') {
      if (array) {
        prev[key] = data[key]; // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] || null; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'dateTimeFields') {
      if (array) {
        prev[key] = data[key].map(item => (isNotDate(item) ? null : item)); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = isNotDate(data[key]) ? null : data[key]; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'geospatialFields') {
      if (geospatialType === 'Point') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map(item => {
            const { longitude, latitude } = item;
            return longitude === '' || latitude === '' ? null : item; // eslint-disable-line no-param-reassign
          });
        } else {
          const { longitude, latitude } = data[key];
          prev[key] = longitude === '' || latitude === '' ? null : data[key]; // eslint-disable-line no-param-reassign
        }
      } else if (geospatialType === 'Polygon') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map(item => {
            // TODO expand test for all empty situations
            const {
              externalRing: { ring: externalRing },
            } = item;
            return externalRing.length < 4 ? null : item; // eslint-disable-line no-param-reassign
          });
        } else {
          // TODO expand test for all empty situations
          const {
            externalRing: { ring: externalRing },
          } = data[key];
          prev[key] = externalRing.length < 4 ? null : data[key]; // eslint-disable-line no-param-reassign
        }
      } else {
        throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${key}"!`);
      }
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
};

export default coerceDataToGql;
