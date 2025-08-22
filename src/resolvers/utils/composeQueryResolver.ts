import pluralize from 'pluralize';

import { GeneralConfig, ServersideConfig } from '@/tsTypes';
import createChildEntitiesThroughConnectionQueryResolver from '../queries/createChildEntitiesThroughConnectionQueryResolver';
import createChildEntityCountQueryResolver from '../queries/createChildEntityCountQueryResolver';
import createEntitiesQueryResolver from '../queries/createEntitiesQueryResolver';
import createEntitiesThroughConnectionQueryResolver from '../queries/createEntitiesThroughConnectionQueryResolver';
import createEntityCountQueryResolver from '../queries/createEntityCountQueryResolver';
import createEntityDistinctValuesQueryResolver from '../queries/createEntityDistinctValuesQueryResolver';
import createEntityQueryResolver from '../queries/createEntityQueryResolver';
import createChildEntityDistinctValuesQueryResolver from '../queries/createChildEntityDistinctValuesQueryResolver';

const queryResolversStore = Object.create(null);

const inAnyCase = true;

const composeQueryResolver = (
  key: string,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const { allEntityConfigs } = generalConfig;

  const [entityName, suffix] = key.split('_');

  if (suffix) {
    const entityConfig = allEntityConfigs[entityName];

    if (!entityConfig) {
      throw new TypeError(`EntityName "${entityName}" not found in "allEntityConfigs"!`);
    }

    if (suffix) {
      switch (suffix) {
        case 'Count': {
          if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
            queryResolversStore[key] = createEntityCountQueryResolver(
              entityConfig,
              generalConfig,
              serversideConfig,
              inAnyCase,
            );
          }

          if (!queryResolversStore[key]) {
            throw new TypeError(
              `Count query resolver for entityName: "${entityName}" not created!`,
            );
          }

          return queryResolversStore[key];
        }

        case 'DistinctValues': {
          if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
            queryResolversStore[key] = createEntityDistinctValuesQueryResolver(
              entityConfig,
              generalConfig,
              serversideConfig,
              inAnyCase,
            );
          }

          if (!queryResolversStore[key]) {
            throw new TypeError(
              `DistinctValues query resolver for entityName: "${entityName}" not created!`,
            );
          }

          return queryResolversStore[key];
        }

        case 'ThroughConnection': {
          if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
            queryResolversStore[key] = createEntitiesThroughConnectionQueryResolver(
              entityConfig,
              generalConfig,
              serversideConfig,
              inAnyCase,
            );
          }

          if (!queryResolversStore[key]) {
            throw new TypeError(
              `ThroughConnection query resolver for entityName: "${entityName}" not created!`,
            );
          }

          return queryResolversStore[key];
        }

        case 'ChildCount': {
          if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
            queryResolversStore[key] = createChildEntityCountQueryResolver(
              entityConfig,
              generalConfig,
              serversideConfig,
              inAnyCase,
            );
          }

          if (!queryResolversStore[key]) {
            throw new TypeError(
              `ChildCount query resolver for entityName: "${entityName}" not created!`,
            );
          }

          return queryResolversStore[key];
        }

        case 'ChildThroughConnection': {
          if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
            queryResolversStore[key] = createChildEntitiesThroughConnectionQueryResolver(
              entityConfig,
              generalConfig,
              serversideConfig,
              inAnyCase,
            );
          }

          if (!queryResolversStore[key]) {
            throw new TypeError(
              `ChildThroughConnection query resolver for entityName: "${entityName}" not created!`,
            );
          }

          return queryResolversStore[key];
        }

        case 'ChildDistinctValues': {
          if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
            queryResolversStore[key] = createChildEntityDistinctValuesQueryResolver(
              entityConfig,
              generalConfig,
              serversideConfig,
              inAnyCase,
            );
          }

          if (!queryResolversStore[key]) {
            throw new TypeError(
              `ChildDistinctValues query resolver for entityName: "${entityName}" not created!`,
            );
          }

          return queryResolversStore[key];
        }

        default:
          throw new TypeError(`Got incorrect query key suffix: "${suffix}"!`);
      }
    }
  }

  if (allEntityConfigs[key]) {
    // "key" is "entityName"

    if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
      queryResolversStore[key] = createEntityQueryResolver(
        allEntityConfigs[key],
        generalConfig,
        serversideConfig,
        inAnyCase,
      );
    }

    if (!queryResolversStore[key]) {
      throw new TypeError(`Query instance resolver for entityName: "${key}" not created!`);
    }

    return queryResolversStore[key];
  }

  const singularKey = pluralize.singular(key);

  if (allEntityConfigs[singularKey]) {
    // "singularKey" is "entityName"

    if (process.env.JEST_WORKER_ID || !queryResolversStore[key]) {
      queryResolversStore[key] = createEntitiesQueryResolver(
        allEntityConfigs[singularKey],
        generalConfig,
        serversideConfig,
        inAnyCase,
      );
    }

    if (!queryResolversStore[key]) {
      throw new TypeError(`Query instances resolver for entityName: "${singularKey}" not created!`);
    }

    return queryResolversStore[key];
  }

  throw new TypeError(`Query resolver for key: "${key}" not created!`);
};

export default composeQueryResolver;
