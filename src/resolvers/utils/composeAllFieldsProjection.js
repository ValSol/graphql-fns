// @flow

import type { ThingConfig } from '../../flowTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';

type Result = { [fieldName: string]: 1 };

const store = {};

const composeAllFieldsProjection = (thingConfig: ThingConfig): Result => {
  const { name: thingName } = thingConfig;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[thingName]) return store[thingName];

  store[thingName] = Object.keys(composeFieldsObject(thingConfig)).reduce((prev, item) => {
    prev[item] = 1; // eslint-disable-line no-param-reassign
    return prev;
  }, {});

  return store[thingName];
};

export default composeAllFieldsProjection;
