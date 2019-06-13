// @flow

import type { ThingConfig } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';

const clearUpdateInputDate = (data: Object, thingConfig: ThingConfig): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  const result = Object.keys(data).reduce((prev, key) => {
    if (fieldsObject[key] === undefined || data[key] === undefined) return prev;

    const { config, kind } = fieldsObject[key];

    if (kind === 'embeddedFields') {
      prev[key] = data[key] === null ? null : clearUpdateInputDate(data[key], config); // eslint-disable-line no-param-reassign
    } else if (kind === 'duplexFields' || kind === 'relationalFields') {
      prev[key] = data[key].connect; // eslint-disable-line no-param-reassign
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  return result;
};

module.exports = clearUpdateInputDate;
