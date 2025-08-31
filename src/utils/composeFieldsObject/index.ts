import type { AnyField, EntityConfig, EntityConfigObject } from '@/tsTypes';

const store = Object.create(null);

const composeFieldsObject = (
  entityConfig: EntityConfig,
  options: { withoutCalculatedFieldsWithAsyncFunc?: boolean } = {},
): { fieldsObject: EntityConfigObject } => {
  const { name: entityName } = entityConfig;
  const { withoutCalculatedFieldsWithAsyncFunc } = options;

  const storeKey = `${entityName}${withoutCalculatedFieldsWithAsyncFunc || false}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  const { fieldsObject, calculatedFieldsWithAsyncObject } = Object.keys(entityConfig).reduce(
    (prev, key) => {
      if (!key.endsWith('Fields')) return prev;

      (entityConfig[key] as AnyField[]).forEach((item) => {
        const { name, type: fieldType, asyncFunc } = item as any;

        if (
          !withoutCalculatedFieldsWithAsyncFunc ||
          !(fieldType === 'calculatedFields' && asyncFunc)
        ) {
          prev.fieldsObject[name] = item;
        } else {
          prev.calculatedFieldsWithAsyncObject[name] = item;
        }
      });

      return prev;
    },
    { fieldsObject: {}, calculatedFieldsWithAsyncObject: {} },
  );

  store[storeKey] = withoutCalculatedFieldsWithAsyncFunc
    ? { calculatedFieldsWithAsyncObject, fieldsObject }
    : { fieldsObject };

  return store[storeKey];
};

export default composeFieldsObject;
