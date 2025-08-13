import pluralize from 'pluralize';

import { GeneralConfig, ServersideConfig } from '../../tsTypes';
import createEntitiesQueryResolver from '../queries/createEntitiesQueryResolver';
import createEntityQueryResolver from '../queries/createEntityQueryResolver';

const queryResolversStore = Object.create(null);

const inAnyCase = true;

const composeQueryResolver = (
  key: string,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const { allEntityConfigs } = generalConfig;

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
