// @flow
import deepEqual from 'fast-deep-equal';

import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';

const coerceDataToGql = (
  data: Object,
  prevData: null | Object,
  thingConfig: ThingConfig,
): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return Object.keys(data).reduce((prev, key) => {
    const { array, config, kind } = fieldsObject[key];

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
        prev[key] = data[key].map(item => ({ connect: item || null })); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = { connect: data[key] || null }; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'enumFields') {
      if (array) {
        prev[key] = data[key]; // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] || null; // eslint-disable-line no-param-reassign
      }
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
};

export default coerceDataToGql;
