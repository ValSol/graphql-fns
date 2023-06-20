// -----------
// server side
// -----------

import composeServersideConfig from './resolvers/utils/composeServersideConfig';

import composeTypeDefsAndResolvers from './composeTypeDefsAndResolvers';

import composeAllEntityConfigs from './utils/composeAllEntityConfigs'


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
import createImportEntitiesMutationResolver from './resolvers/mutations/createImportEntitiesMutationResolver';
import createPushIntoEntityMutationResolver from './resolvers/mutations/createPushIntoEntityMutationResolver';
import createUpdateFilteredEntitiesMutationResolver from './resolvers/mutations/createUpdateFilteredEntitiesMutationResolver';
import createUpdateManyEntitiesMutationResolver from './resolvers/mutations/createUpdateManyEntitiesMutationResolver';
import createUpdateEntityMutationResolver from './resolvers/mutations/createUpdateEntityMutationResolver';
import createUploadEntityFilesMutationResolver from './resolvers/mutations/createUploadEntityFilesMutationResolver';

// query resolvers
import createEntityDistinctValuesQueryResolver from './resolvers/queries/createEntityDistinctValuesQueryResolver';
import createEntityCountQueryResolver from './resolvers/queries/createEntityCountQueryResolver';
import createEntityFileCountQueryResolver from './resolvers/queries/createEntityFileCountQueryResolver';
import createEntityFileQueryResolver from './resolvers/queries/createEntityFileQueryResolver';
import createEntityFilesQueryResolver from './resolvers/queries/createEntityFilesQueryResolver';
import createEntityQueryResolver from './resolvers/queries/createEntityQueryResolver';
import createEntitiesQueryResolver from './resolvers/queries/createEntitiesQueryResolver';
import createEntitiesByUniqueQueryResolver from './resolvers/queries/createEntitiesByUniqueQueryResolver';

// subscription resolvers
import createCreatedEntitySubscriptionResolver from './resolvers/subscriptions/createCreatedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from './resolvers/subscriptions/createUpdatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from './resolvers/subscriptions/createDeletedEntitySubscriptionResolver';

// -----------
// client side
// -----------

import composeMutation from './client/mutations/composeMutation';
import composeQuery from './client/queries/composeQuery';
import composeSubscription from './client/subscriptions/composeSubscription';
import createExportFile from './client/utils/createExportFile';

// admin
// import Admin  from './components/Admin';

export {
  composeServersideConfig,
  composeTypeDefsAndResolvers,
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
  createImportEntitiesMutationResolver,
  createPushIntoEntityMutationResolver,
  createUpdateFilteredEntitiesMutationResolver,
  createUpdateManyEntitiesMutationResolver,
  createUpdateEntityMutationResolver,
  createUploadEntityFilesMutationResolver,
  createEntityDistinctValuesQueryResolver,
  createEntityCountQueryResolver,
  createEntityFileCountQueryResolver,
  createEntityFileQueryResolver,
  createEntityFilesQueryResolver,
  createEntityQueryResolver,
  createEntitiesQueryResolver,
  createEntitiesByUniqueQueryResolver,
  createCreatedEntitySubscriptionResolver,
  createUpdatedEntitySubscriptionResolver,
  createDeletedEntitySubscriptionResolver,
  composeMutation,
  composeQuery,
  composeSubscription,
  createExportFile,
};
