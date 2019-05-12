//  turn off flow to eliminate errors in flowTypes.js

import type { ThingConfig } from '../../flowTypes';

const composeWhereFields = (thingConfig: ThingConfig): Object => {
  const result = Object.keys(thingConfig).reduce((prev, key) => {
    if (key.slice(-6) === 'Fields' && Array.isArray(thingConfig[key])) {
      thingConfig[key].forEach(({ name, index }) => {
        if (index) {
          // eslint-disable-next-line no-param-reassign
          prev[name] = key;
        }
      });
    }
    return prev;
  }, {});

  return result;
};

module.exports = composeWhereFields;
