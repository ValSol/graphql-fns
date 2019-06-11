// @flow
import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';

const coerceDataToGql = (data: Object, thingConfig: ThingConfig): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return Object.keys(data).reduce((prev, key) => {
    if (fieldsObject[key] === undefined) return prev;
    const { array, config, kind } = fieldsObject[key];

    if (kind === 'embeddedFields') {
      if (array) {
        prev[key] = data[key].map(item => coerceDataToGql(item, config)); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = coerceDataToGql(data[key], config); // eslint-disable-line no-param-reassign
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
