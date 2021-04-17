// @flow

import type { ThingConfig } from '../../../flowTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';

const composeRelationalKey = (
  value: Object,
  lookupArray: Array<string>,
  thingConfig: ThingConfig,
): {
  relationalKey: string,
  thingConfig: ThingConfig,
  value: Object,
} => {
  let currentValue = value;
  let currentConfig = thingConfig;
  let relationalKey = '';
  let goToNext = true;

  while (goToNext) {
    const keys = Object.keys(currentValue);
    const [key] = keys;
    if (key.endsWith('_')) {
      if (keys.length > 1) {
        throw new TypeError(`keys length must be "1" but "${keys.length}"!`);
      }

      const fieldName = key.slice(0, -1);
      const fieldsObject = composeFieldsObject(currentConfig);

      const { attributes } = fieldsObject[fieldName];

      if (!attributes.config) {
        throw new TypeError(`Field "${fieldName}" must has attr "config"!`);
      }

      currentConfig = attributes.config;

      const lookupArrayItem = `${relationalKey}:${key}:${currentConfig.name}`;

      if (!lookupArray.includes(lookupArrayItem)) {
        lookupArray.push(lookupArrayItem);
      }

      currentValue = currentValue[key];
      relationalKey += key;
    } else {
      goToNext = false;
    }
  }

  return {
    relationalKey,
    thingConfig: currentConfig,
    value: currentValue,
  };
};

export default composeRelationalKey;
