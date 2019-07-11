// @flow

import type { ThingConfig } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';

const clearUpdateInputData = (data: Object, thingConfig: ThingConfig): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = Object.keys(data).reduce((prev, key) => {
    if (fieldsObject[key] === undefined || data[key] === undefined) return prev;

    const {
      attributes: { array },
      kind,
    } = fieldsObject[key];

    if (fieldsObject[key].kind === 'embeddedFields') {
      const { config } = fieldsObject[key].attributes;
      if (array) {
        prev[key] = data[key].map(item => clearUpdateInputData(item, config)); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = clearUpdateInputData(data[key], config); // eslint-disable-line no-param-reassign
      }
    } else if (kind === 'duplexFields' || kind === 'relationalFields') {
      prev[key] = data[key].connect; // eslint-disable-line no-param-reassign
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  return result;
};

export default clearUpdateInputData;
