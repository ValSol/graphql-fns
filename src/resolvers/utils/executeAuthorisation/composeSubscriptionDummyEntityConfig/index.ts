import { AnyField, EntityConfig, TangibleEntityConfig } from '@/tsTypes';

const composeSubscriptionDummyEntityConfig = (entityConfig: EntityConfig): EntityConfig => {
  const {
    name,
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

  return dummyEntityConfig as EntityConfig;
};

export default composeSubscriptionDummyEntityConfig;
