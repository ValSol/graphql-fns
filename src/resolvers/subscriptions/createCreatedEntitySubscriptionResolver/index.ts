import type { GeneralConfig, Subscribe, EntityConfig, ServersideConfig } from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import withFilterAndTransformer from '../withFilterAndTransformer';

const createCreatedEntitySubscriptionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  if (!checkInventory(['Subscription', 'createdEntity', name], inventory)) {
    return null;
  }

  const resolver: Subscribe = {
    subscribe: (_, args, context, info, { involvedFilters }) =>
      withFilterAndTransformer(context.pubsub.subscribe(`created-${name}`), (payload) => {
        // const { filter } = getFilterFromInvolvedFilters(involvedFilters);

        console.log('involvedFilters =', involvedFilters);

        // if (!filter) {
        //   return false;
        // }

        // const { id } = payload;

        // const { where } = mergeWhereAndFilter(filter, args.where || {}, entityConfig);

        console.log('payload =', payload);

        return true;
      }),
  };

  return resolver;
};

export default createCreatedEntitySubscriptionResolver;
