// -----------
// server side
// -----------

import composeServersideConfig from './resolvers/utils/composeServersideConfig';

import composeTypeDefsAndResolvers from './composeTypeDefsAndResolvers';

import composeManuallyCreatedResolvers from './composeManuallyCreatedResolvers';

import composeAllEntityConfigs from './utils/composeAllEntityConfigs';

// mutation resolvers
import createCopyManyEntitiesMutationResolver from './resolvers/mutations/createCopyManyEntitiesMutationResolver';
import createCopyManyEntitiesWithChildrenMutationResolver from './resolvers/mutations/createCopyManyEntitiesWithChildrenMutationResolver';
import createCopyEntityMutationResolver from './resolvers/mutations/createCopyEntityMutationResolver';
import createCopyEntityWithChildrenMutationResolver from './resolvers/mutations/createCopyEntityWithChildrenMutationResolver';
import createCreateManyEntitiesMutationResolver from './resolvers/mutations/createCreateManyEntitiesMutationResolver';
import createCreateEntityMutationResolver from './resolvers/mutations/createCreateEntityMutationResolver';
import createDeleteEntityMutationResolver from './resolvers/mutations/createDeleteEntityMutationResolver';
import createDeleteEntityWithChildrenMutationResolver from './resolvers/mutations/createDeleteEntityWithChildrenMutationResolver';
import createDeleteFilteredEntitiesMutationResolver from './resolvers/mutations/createDeleteFilteredEntitiesMutationResolver';
import createDeleteFilteredEntitiesWithChildrenMutationResolver from './resolvers/mutations/createDeleteFilteredEntitiesWithChildrenMutationResolver';
import createDeleteManyEntitiesMutationResolver from './resolvers/mutations/createDeleteManyEntitiesMutationResolver';
import createDeleteManyEntitiesWithChildrenMutationResolver from './resolvers/mutations/createDeleteManyEntitiesWithChildrenMutationResolver';
import createPushIntoEntityMutationResolver from './resolvers/mutations/createPushIntoEntityMutationResolver';
import createUpdateFilteredEntitiesMutationResolver from './resolvers/mutations/createUpdateFilteredEntitiesMutationResolver';
import createUpdateManyEntitiesMutationResolver from './resolvers/mutations/createUpdateManyEntitiesMutationResolver';
import createUpdateEntityMutationResolver from './resolvers/mutations/createUpdateEntityMutationResolver';

// query resolvers
import createEntityDistinctValuesQueryResolver from './resolvers/queries/createEntityDistinctValuesQueryResolver';
import createEntityCountQueryResolver from './resolvers/queries/createEntityCountQueryResolver';
import createEntityQueryResolver from './resolvers/queries/createEntityQueryResolver';
import createEntitiesQueryResolver from './resolvers/queries/createEntitiesQueryResolver';
import createEntitiesByUniqueQueryResolver from './resolvers/queries/createEntitiesByUniqueQueryResolver';
import createEntitiesThroughConnectionQueryResolver from './resolvers/queries/createEntitiesThroughConnectionQueryResolver';

// subscription resolvers
import createCreatedEntitySubscriptionResolver from './resolvers/subscriptions/createCreatedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from './resolvers/subscriptions/createUpdatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from './resolvers/subscriptions/createDeletedEntitySubscriptionResolver';

// admin
// import Admin  from './components/Admin';

export {
  composeServersideConfig,
  composeTypeDefsAndResolvers,
  composeManuallyCreatedResolvers,
  composeAllEntityConfigs,
  createCopyManyEntitiesMutationResolver,
  createCopyManyEntitiesWithChildrenMutationResolver,
  createCopyEntityMutationResolver,
  createCopyEntityWithChildrenMutationResolver,
  createCreateManyEntitiesMutationResolver,
  createCreateEntityMutationResolver,
  createDeleteEntityMutationResolver,
  createDeleteEntityWithChildrenMutationResolver,
  createDeleteFilteredEntitiesMutationResolver,
  createDeleteFilteredEntitiesWithChildrenMutationResolver,
  createDeleteManyEntitiesMutationResolver,
  createDeleteManyEntitiesWithChildrenMutationResolver,
  createPushIntoEntityMutationResolver,
  createUpdateFilteredEntitiesMutationResolver,
  createUpdateManyEntitiesMutationResolver,
  createUpdateEntityMutationResolver,
  createEntityDistinctValuesQueryResolver,
  createEntityCountQueryResolver,
  createEntityQueryResolver,
  createEntitiesQueryResolver,
  createEntitiesByUniqueQueryResolver,
  createEntitiesThroughConnectionQueryResolver,
  createCreatedEntitySubscriptionResolver,
  createUpdatedEntitySubscriptionResolver,
  createDeletedEntitySubscriptionResolver,
};
