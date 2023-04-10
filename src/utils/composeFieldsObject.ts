import type { AnyField, EntityConfig, EntityConfigObject } from '../tsTypes';

const store = Object.create(null);

const composeFieldsObject = (entityConfig: EntityConfig): EntityConfigObject => {
  const { name: entityName } = entityConfig;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[entityName]) return store[entityName];

  return Object.keys(entityConfig).reduce((prev, key) => {
    if (!key.endsWith('Fields')) return prev;

    (entityConfig[key] as AnyField[]).forEach((item) => {
      const { name } = item;

      prev[name] = item; // eslint-disable-line no-param-reassign
    });

    return prev;
  }, {});
};

export default composeFieldsObject;
