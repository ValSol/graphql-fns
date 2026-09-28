import type { AnyField, EntityConfig, EntityConfigObject, TangibleEntityConfig } from '@/tsTypes';
import createObjectBoundStore from '@/utils/createObjectBoundStore';

// separate cache for every entityConfig object (not by name, that can be the same for different configs)
const getStore = createObjectBoundStore();

export const FOR_MONGO_QUERY = 'forMongoQuery' as const;
export const WITHOUT_CALCULATED_WITH_ASYNC = 'withoutCalculatedWithAsync' as const;

type Filter = typeof FOR_MONGO_QUERY | typeof WITHOUT_CALCULATED_WITH_ASYNC | '';

const composeFieldsObject = (
  entityConfig: EntityConfig,
  filterVariant: Filter = '',
): { fieldsObject: EntityConfigObject; restOfFieldsObject?: EntityConfig } => {
  const {
    name: entityName,
    allowedCalculatedWithAsyncFuncFieldNames = [],
    subscriptionActorConfig,
  } = entityConfig as TangibleEntityConfig;

  const store = getStore(entityConfig);

  const storeKey = `${entityName}${filterVariant}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[storeKey]) return store[storeKey];

  const subscriptionActorConfigFieldNames = subscriptionActorConfig
    ? Object.keys(composeFieldsObject(subscriptionActorConfig, FOR_MONGO_QUERY).fieldsObject)
    : [];

  const { fieldsObject, restOfFieldsObject } = Object.keys(entityConfig).reduce(
    (prev, key) => {
      if (!key.endsWith('Fields')) return prev;

      (entityConfig[key] as AnyField[]).forEach((item) => {
        const { name, type: fieldType, async } = item as any;

        switch (filterVariant) {
          case FOR_MONGO_QUERY:
            if (['calculatedFields', 'filterFields'].includes(fieldType)) {
              prev.restOfFieldsObject[name] = item;
            } else {
              prev.fieldsObject[name] = item;
            }

            break;

          case WITHOUT_CALCULATED_WITH_ASYNC:
            if (
              fieldType === 'calculatedFields' &&
              async &&
              !allowedCalculatedWithAsyncFuncFieldNames.includes(name) &&
              !subscriptionActorConfigFieldNames.includes(name)
            ) {
              prev.restOfFieldsObject[name] = item;
            } else {
              prev.fieldsObject[name] = item;
            }

            break;

          case '':
            prev.fieldsObject[name] = item;

            break;

          default:
            throw new TypeError(`Got incorrect filterVariant: "${filterVariant}"!`);
        }
      });

      return prev;
    },

    { fieldsObject: {}, restOfFieldsObject: {} },
  );

  store[storeKey] = filterVariant ? { fieldsObject, restOfFieldsObject } : { fieldsObject };

  return store[storeKey];
};

export default composeFieldsObject;
