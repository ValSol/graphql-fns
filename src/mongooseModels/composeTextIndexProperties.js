// @flow

import type { EntityConfig } from '../flowTypes';

const composeTextIndexProperties = (
  entityConfig: EntityConfig,
  parent: string = '',
): { [key: string]: number } => {
  const { embeddedFields = [], fileFields = [], textFields = [] } = entityConfig;

  const result = textFields.reduce((prev, { name, weight }) => {
    if (weight) {
      prev[`${parent}${name}`] = weight; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

  embeddedFields.reduce((prev, { name, config }) => {
    const result2 = composeTextIndexProperties(config, `${parent}${name}.`);

    Object.keys(result2).forEach((key) => {
      prev[key] = result2[key]; // eslint-disable-line no-param-reassign
    });

    return prev;
  }, result);

  fileFields.reduce((prev, { name, config }) => {
    const result2 = composeTextIndexProperties(config, `${parent}${name}.`);

    Object.keys(result2).forEach((key) => {
      prev[key] = result2[key]; // eslint-disable-line no-param-reassign
    });

    return prev;
  }, result);

  return result;
};

export default composeTextIndexProperties;
