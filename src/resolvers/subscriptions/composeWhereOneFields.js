//  turn off flow to eliminate errors in flowTypes.js

import type { ThingConfig } from '../../flowTypes';

const composeWhereOneFields = (thingConfig: ThingConfig): Object => {
  const result = Object.keys(thingConfig).reduce(
    (prev, key) => {
      if (key.slice(-6) === 'Fields' && Array.isArray(thingConfig[key])) {
        thingConfig[key].forEach(({ name, unique }) => {
          if (unique) {
            // eslint-disable-next-line no-param-reassign
            prev[name] = key;
          }
        });
      }
      return prev;
    },
    { id: null },
  );

  return result;
};

module.exports = composeWhereOneFields;
