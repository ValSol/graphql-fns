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

  calculatedFields.forEach((field) => {
    const { name, calculatedType, array, asyncFunc } = field;

    if (asyncFunc && !allowedCalculatedWithAsyncFuncFieldNames.includes(name)) {
      return;
    }

    // virtual objects are not filtered (the same as in "createEntityWherePayloadInputType")
    if (calculatedType === 'virtualFields') return;

    if (calculatedType === 'filterFields') {
      dummyEntityConfig.textFields.push({ name, array, type: 'textFields' });
    } else {
      if (!dummyEntityConfig[calculatedType]) {
        dummyEntityConfig[calculatedType] = [];
      }

      // keep "config" (embedded), "enumName" & "geospatialType" that are used to compose filter
      const { config, enumName, geospatialType } = field as any;

      dummyEntityConfig[calculatedType].push({
        name,
        array,
        type: calculatedType,
        ...(config && { config }),
        ...(enumName && { enumName }),
        ...(geospatialType && { geospatialType }),
      } as any);
    }
  });

  store[name] = dummyEntityConfig as EntityConfig;

  return store[name];
};

export default composeSubscriptionDummyEntityConfig;
