// @flow
import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';

const coerceDataFromGql = (data: Object, thingConfig: ThingConfig): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return Object.keys(data).reduce((prev, key) => {
    if (fieldsObject[key] === undefined) return prev;
    const { array, config, kind } = fieldsObject[key];
    if (kind === 'relationalFields' || kind === 'duplexFields') {
      if (array) {
        prev[key] = data[key].map(({ id }) => id); // eslint-disable-line no-param-reassign
      } else if (data[key]) {
        prev[key] = data[key].id; // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'embeddedFields' && data[key]) {
      if (array) {
        prev[key] = data[key].map(item => coerceDataFromGql(item, config)); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = coerceDataFromGql(data[key], config); // eslint-disable-line no-param-reassign
      }
    } else if (data[key] !== undefined) {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});
};

export default coerceDataFromGql;
