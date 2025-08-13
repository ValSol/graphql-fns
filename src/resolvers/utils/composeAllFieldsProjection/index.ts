import type { EntityConfig } from '../../../tsTypes';

import composeFieldsObject from '../../../utils/composeFieldsObject';

type Result = {
  [fieldName: string]: 1;
};

const store: Record<string, any> = {};

const composeAllFieldsProjection = (
  entityConfig: EntityConfig,
  options: { withoutCalculatedFieldsWithAsyncFunc?: boolean } = {},
): Result => {
  const { name: entityName } = entityConfig;

  const storeKey = `${store[entityName]}${options.withoutCalculatedFieldsWithAsyncFunc || false}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  store[storeKey] = Object.keys(composeFieldsObject(entityConfig, options)).reduce<
    Record<string, 1>
  >(
    (prev, item) => {
      prev[item] = 1;
      return prev;
    },
    { createdAt: 1, updatedAt: 1 },
  );

  if ((entityConfig as any).counter) {
    store[storeKey].counter = 1;
  }

  return store[storeKey];
};

export default composeAllFieldsProjection;
