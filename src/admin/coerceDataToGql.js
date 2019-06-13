// @flow
import deepEqual from 'fast-deep-equal';

import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';
import composeEmptyValues from './composeEmptyValues';

const coerceDataToGql = (
  data: Object,
  prevData: null | Object,
  thingConfig: ThingConfig,
): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);
  const emptyData = composeEmptyValues(thingConfig);

  return Object.keys(fieldsObject).reduce((prev, key) => {
    const { array, config, kind } = fieldsObject[key];

    if (prevData !== null) {
      if (deepEqual(data[key], prevData[key])) return prev;

      if (!array && deepEqual(data[key], emptyData[key])) {
        if (kind === 'relationalFields' || kind === 'duplexFields') {
          prev[key] = { connect: null }; // eslint-disable-line no-param-reassign
        } else {
          prev[key] = null; // eslint-disable-line no-param-reassign
        }
        return prev;
      }
    }

    if (kind === 'embeddedFields') {
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map((item, i) =>
          coerceDataToGql(
            item,
            prevData === null || !Array.isArray(prevData[key]) ? null : prevData[key][i],
            config,
          ),
        );
      } else {
        prev[key] = coerceDataToGql(data[key], prevData === null ? null : prevData[key], config); // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'relationalFields' || kind === 'duplexFields') {
      if (data[key]) prev[key] = { connect: data[key] }; // eslint-disable-line no-param-reassign
    } else if (kind === 'enumFields' && !data[key]) {
      // do nothing
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
};

export default coerceDataToGql;
