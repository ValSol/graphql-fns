// @flow

import type { ThingConfig } from '../flowTypes';

const composeTextIndexProperties = (thingConfig: ThingConfig): { [key: string]: number } => {
  const { embedded, file, textFields } = thingConfig;

  const result = {};

  if (textFields) {
    textFields.reduce((prev, { name, weight }) => {
      if (weight && (embedded || file)) {
        throw new TypeError(
          'Must not have an "weight" for text field in an embedded or file document!',
        );
      }
      if (weight) {
        prev[name] = weight; // eslint-disable-line no-param-reassign
      }
      return prev;
    }, result);
  }

  return result;
};

export default composeTextIndexProperties;
