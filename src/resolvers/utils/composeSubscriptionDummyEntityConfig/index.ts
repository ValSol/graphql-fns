import { EntityConfig, TangibleEntityConfig } from '@/tsTypes';

const store = Object.create(null);

const composeSubscriptionDummyEntityConfig = (entityConfig: EntityConfig): EntityConfig => {
  const { name } = entityConfig as TangibleEntityConfig;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[name]) {
    return store[name];
  }

  const {
    allowedCalculatedWithAsyncFuncFieldNames = [],
    relationalFields = [],
    duplexFields = [],
    filterFields = [],
    calculatedFields = [],

    ...dummyEntityConfig
  } = entityConfig as TangibleEntityConfig;

  Object.keys(dummyEntityConfig).forEach((key) => {
    if (key.endsWith('Fields')) {
      dummyEntityConfig[key] = [...dummyEntityConfig[key]];
    }
  });

  (dummyEntityConfig as EntityConfig).name = `Dummy${name}`;

  if (!dummyEntityConfig.textFields) {
    dummyEntityConfig.textFields = [];
  }

  [...relationalFields, ...duplexFields, ...filterFields].forEach(({ name, array }) => {
    dummyEntityConfig.textFields.push({ name, array, type: 'textFields' });
  });

  calculatedFields.forEach(({ name, calculatedType, array, asyncFunc }) => {
    if (asyncFunc && !allowedCalculatedWithAsyncFuncFieldNames.includes(name)) {
      return;
    }

    if (calculatedType === 'filterFields') {
      dummyEntityConfig.textFields.push({ name, array, type: 'textFields' });
    } else {
      if (!dummyEntityConfig[calculatedType]) {
        dummyEntityConfig[calculatedType] = [];
      }

      dummyEntityConfig[calculatedType].push({ name, array, type: calculatedType } as any);
    }
  });

  store[name] = dummyEntityConfig as EntityConfig;

  return store[name];
};

export default composeSubscriptionDummyEntityConfig;
