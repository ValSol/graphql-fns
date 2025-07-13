import type { EntityConfig } from '../../tsTypes';

import composeFieldsObject from '../../utils/composeFieldsObject';

type Result = {
  [fieldName: string]: 1;
};

const store: Record<string, any> = {};

const composeAllFieldsProjection = (entityConfig: EntityConfig): Result => {
  const { name: entityName } = entityConfig;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityName]) return store[entityName];

  store[entityName] = Object.keys(composeFieldsObject(entityConfig)).reduce<Record<string, 1>>(
    (prev, item) => {
      prev[item] = 1;
      return prev;
    },
    { createdAt: 1, updatedAt: 1 },
  );

  if ((entityConfig as any).counter) {
    store[entityName].counter = 1;
  }

  return store[entityName];
};

export default composeAllFieldsProjection;
