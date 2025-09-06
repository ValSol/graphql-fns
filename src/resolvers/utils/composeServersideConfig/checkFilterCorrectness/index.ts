import type { GeneralConfig } from '@/tsTypes';

import parseEntityName from '@/utils/parseEntityName';
import composeSubscriptionDummyEntityConfig from '@/resolvers/utils/composeSubscriptionDummyEntityConfig';
import composeWhereInput from '@/resolvers/utils/mergeWhereAndFilter/composeWhereInput';

const checkFilterCorrectness = (
  entityName: string,
  filter: {
    [key: string]: any;
  },
  generalConfig: GeneralConfig,
  isSubscribePayloadFilter: boolean = false,
): true => {
  const typeofFilter = typeof filter;
  if (typeofFilter !== 'object') {
    throw new TypeError(`Filter is "${typeofFilter}" but has to be "Object!"`);
  }

  if (filter === null) {
    throw new TypeError('Filter is "null" but has to be "Object!"');
  }

  if (Array.isArray(null)) {
    throw new TypeError('Filter is "Array" but has to be "Object!"');
  }

  const { allEntityConfigs } = generalConfig;

  if (isSubscribePayloadFilter) {
    const entityConfig = allEntityConfigs[entityName];

    const dummyEntityConfig = composeSubscriptionDummyEntityConfig(entityConfig);

    composeWhereInput(filter, dummyEntityConfig);
  } else {
    const { root: rootEntityName } = parseEntityName(entityName, generalConfig);

    const entityConfig = allEntityConfigs[rootEntityName];

    composeWhereInput(filter, entityConfig);
  }

  return true;
};

export default checkFilterCorrectness;
