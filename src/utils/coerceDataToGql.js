// @flow
import deepEqual from 'fast-deep-equal';

import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from './composeFieldsObject';

const isNotDate = date =>
  new Date(date).toString() === 'Invalid Date' || Number.isNaN(new Date(date));

const coerceDataToGql = (
  data: Object,
  prevData: null | Object,
  thingConfig: ThingConfig,
): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  const { id, createdAt, updatedAt, ...rest } = data;

  const result = Object.keys(rest).reduce((prev, key) => {
    const {
      attributes: { array },
      kind,
    } = fieldsObject[key];

    if (prevData && deepEqual(data[key], prevData[key])) {
      return prev;
    }

    if (fieldsObject[key].kind === 'embeddedFields') {
      const { config } = fieldsObject[key].attributes;
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
    } else if (kind === 'intFields' || kind === 'floatFields') {
      if (array) {
        prev[key] = data[key].filter(item => item !== ''); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] === '' ? null : data[key]; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'dateTimeFields') {
      if (array) {
        prev[key] = data[key].map(item => (isNotDate(item) ? null : item)).filter(Boolean); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = isNotDate(data[key]) ? null : data[key]; // eslint-disable-line no-param-reassign
      }
    } else if (fieldsObject[key].kind === 'geospatialFields') {
      const { geospatialType } = fieldsObject[key].attributes;
      if (geospatialType === 'Point') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key]
            .map(item => {
              const { lng, lat } = item;
              return lng === '' || lat === '' ? null : item; // eslint-disable-line no-param-reassign
            })
            .filter(Boolean);
        } else {
          const { lng, lat } = data[key];
          prev[key] = lng === '' || lat === '' ? null : data[key]; // eslint-disable-line no-param-reassign
        }
      } else if (geospatialType === 'Polygon') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key]
            .map(item => {
              // TODO expand test for all empty situations
              const {
                externalRing: { ring: externalRing },
              } = item;
              return externalRing.length < 4 ? null : item; // eslint-disable-line no-param-reassign
            })
            .filter(Boolean);
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

  if (id) result.id = id;
  if (createdAt) result.createdAt = createdAt;
  if (updatedAt) result.updatedAt = updatedAt;

  return result;
};

export default coerceDataToGql;
