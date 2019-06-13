// @flow
import type { ThingConfig } from '../flowTypes';

import composeFieldsObject from '../utils/composeFieldsObject';
import composeEmptyValues from './composeEmptyValues';

const coerceDataFromGql = (data: Object, thingConfig: ThingConfig): Object => {
  const fieldsObject = composeFieldsObject(thingConfig);

  return Object.keys(data).reduce((prev, key) => {
    if (fieldsObject[key] === undefined) return prev;
    const { array, config, kind } = fieldsObject[key];
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
    } else if (kind === 'embeddedFields') {
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
