// @flow

import type { EntityConfig } from '../flowTypes';

const composeTextIndexProperties = (entityConfig: EntityConfig): { [key: string]: number } => {
  const { textFields, type: configType } = entityConfig;

  const result = {};

  if (textFields) {
    textFields.reduce((prev, { name, weight }) => {
      if (weight && configType !== 'tangible') {
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
