import type { EntityConfig } from '@/tsTypes';

import composeFieldsObject, {
  FOR_MONGO_QUERY,
  WITHOUT_CALCULATED_WITH_ASYNC,
} from '@/utils/composeFieldsObject';

type Result = {
  [fieldName: string]: 1;
};

const store: Record<string, any> = {};

type Filter = typeof FOR_MONGO_QUERY | typeof WITHOUT_CALCULATED_WITH_ASYNC | '';

const composeAllFieldsProjection = (
  entityConfig: EntityConfig,
  filterVariant: Filter = '',
): Result => {
  const { name: entityName } = entityConfig;

  const storeKey = `${entityName}:${filterVariant}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  store[storeKey] = Object.keys(
    composeFieldsObject(entityConfig, filterVariant).fieldsObject,
  ).reduce<Record<string, 1>>(
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
