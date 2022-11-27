// @flow

import type { EntityConfig } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';

type Result = { [fieldName: string]: 1 };

const store = {};

const composeAllFieldsProjection = (entityConfig: EntityConfig): Result => {
  const { name: entityName } = entityConfig;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityName]) return store[entityName];

  store[entityName] = Object.keys(composeFieldsObject(entityConfig)).reduce((prev, item) => {
    prev[item] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  return store[entityName];
};

export default composeAllFieldsProjection;
