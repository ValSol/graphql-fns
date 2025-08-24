// mongoose util

import createThingSchema from '@/mongooseModels/createThingSchema';

// build schema utils

import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import composeManuallyCreatedResolvers from '@/composeManuallyCreatedResolvers';
import composeServersideConfig from '@/resolvers/utils/composeServersideConfig';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeCustom from '@/utils/composeCustom';
import composeDescendant from '@/utils/composeDescendant';
import composeDescendantConfigByName from '@/utils/composeDescendantConfigByName';
import pubsub from '@/resolvers/utils/pubsub';

// mutation resolvers

import createCopyManyEntitiesMutationResolver from '@/resolvers/mutations/createCopyManyEntitiesMutationResolver';
import createCopyManyEntitiesWithChildrenMutationResolver from '@/resolvers/mutations/createCopyManyEntitiesWithChildrenMutationResolver';
import createCopyEntityMutationResolver from '@/resolvers/mutations/createCopyEntityMutationResolver';
import createCopyEntityWithChildrenMutationResolver from '@/resolvers/mutations/createCopyEntityWithChildrenMutationResolver';
import createCreateManyEntitiesMutationResolver from '@/resolvers/mutations/createCreateManyEntitiesMutationResolver';
import createCreateEntityMutationResolver from '@/resolvers/mutations/createCreateEntityMutationResolver';
import createDeleteEntityMutationResolver from '@/resolvers/mutations/createDeleteEntityMutationResolver';
import createDeleteEntityWithChildrenMutationResolver from '@/resolvers/mutations/createDeleteEntityWithChildrenMutationResolver';
import createDeleteFilteredEntitiesMutationResolver from '@/resolvers/mutations/createDeleteFilteredEntitiesMutationResolver';
import createDeleteFilteredEntitiesWithChildrenMutationResolver from '@/resolvers/mutations/createDeleteFilteredEntitiesWithChildrenMutationResolver';
import createDeleteManyEntitiesMutationResolver from '@/resolvers/mutations/createDeleteManyEntitiesMutationResolver';
import createDeleteManyEntitiesWithChildrenMutationResolver from '@/resolvers/mutations/createDeleteManyEntitiesWithChildrenMutationResolver';
import createPushIntoEntityMutationResolver from '@/resolvers/mutations/createPushIntoEntityMutationResolver';
import createUpdateEntityMutationResolver from '@/resolvers/mutations/createUpdateEntityMutationResolver';
import createUpdateFilteredEntitiesMutationResolver from '@/resolvers/mutations/createUpdateFilteredEntitiesMutationResolver';
import createUpdateFilteredEntitiesReturnScalarMutationResolver from '@/resolvers/mutations/createUpdateFilteredEntitiesReturnScalarMutationResolver';
import createUpdateManyEntitiesMutationResolver from '@/resolvers/mutations/createUpdateManyEntitiesMutationResolver';
import workOutMutations from '@/resolvers/mutations/workOutMutations';

// query resolvers

import createChildEntitiesThroughConnectionQueryResolver from '@/resolvers/queries/createChildEntitiesThroughConnectionQueryResolver';
import createChildEntityCountQueryResolver from '@/resolvers/queries/createChildEntityCountQueryResolver';
import createEntityDistinctValuesQueryResolver from '@/resolvers/queries/createEntityDistinctValuesQueryResolver';
import createEntityCountQueryResolver from '@/resolvers/queries/createEntityCountQueryResolver';
import createEntityQueryResolver from '@/resolvers/queries/createEntityQueryResolver';
import createEntitiesQueryResolver from '@/resolvers/queries/createEntitiesQueryResolver';
import createEntitiesByUniqueQueryResolver from '@/resolvers/queries/createEntitiesByUniqueQueryResolver';
import createEntitiesThroughConnectionQueryResolver from '@/resolvers/queries/createEntitiesThroughConnectionQueryResolver';

// subscription resolvers

import createCreatedEntitySubscriptionResolver from '@/resolvers/subscriptions/createCreatedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from '@/resolvers/subscriptions/createUpdatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from '@/resolvers/subscriptions/createDeletedEntitySubscriptionResolver';

// graphql types utils

import multiPolygonFromMongoToGql from '@/resolvers/types/multiPolygonFromMongoToGql';
import pointFromGqlToMongo from '@/resolvers/mutations/processCreateInputData/pointFromGqlToMongo';
import pointFromMongoToGql from '@/resolvers/types/pointFromMongoToGql';
import polygonFromMongoToGql from '@/resolvers/types/polygonFromMongoToGql';

// utils

import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import composeAllFieldsProjection from '@/resolvers/utils/composeAllFieldsProjection';
import composeFieldsObject from '@/utils/composeFieldsObject';
import composePersonalFilter from '@/resolvers/utils/executeAuthorisation/composePersonalFilter';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import composeUserFilter from '@/resolvers/utils/executeAuthorisation/composeUserFilter';
import createInfoEssence from './resolvers/utils/createInfoEssence';
import getInfoEssence from './resolvers/utils/getInfoEssence';
import injectStaticOrPersonalFilter from '@/resolvers/utils/executeAuthorisation/injectStaticOrPersonalFilter';
import fromGlobalId from '@/resolvers/utils/fromGlobalId';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import getSimpleProjectionFromInfo from '@/resolvers/utils/getSimpleProjectionFromInfo';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import toGlobalId from '@/resolvers/utils/toGlobalId';

// types

export type * from '@/tsTypes';

// export all

export {
  adaptProjectionForCalculatedFields,
  createThingSchema,
  composeTypeDefsAndResolvers,
  composeManuallyCreatedResolvers,
  composeServersideConfig,
  composeAllEntityConfigs,
  composeCustom,
  composeDescendant,
  composeDescendantConfigByName,
  composeQueryResolver,
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
  createUpdateFilteredEntitiesReturnScalarMutationResolver,
  createUpdateManyEntitiesMutationResolver,
  createUpdateEntityMutationResolver,
  workOutMutations,
  createChildEntitiesThroughConnectionQueryResolver,
  createChildEntityCountQueryResolver,
  createEntityDistinctValuesQueryResolver,
  createEntityCountQueryResolver,
  createEntityQueryResolver,
  createEntitiesQueryResolver,
  createEntitiesByUniqueQueryResolver,
  createEntitiesThroughConnectionQueryResolver,
  createCreatedEntitySubscriptionResolver, // why may be need to pass this?
  createUpdatedEntitySubscriptionResolver, // why may be need to pass this?
  createDeletedEntitySubscriptionResolver, // why may be need to pass this?
  multiPolygonFromMongoToGql,
  pointFromGqlToMongo,
  pointFromMongoToGql,
  polygonFromMongoToGql,
  pubsub,
  composeAllFieldsProjection,
  composeFieldsObject,
  composePersonalFilter,
  composeUserFilter,
  createInfoEssence,
  injectStaticOrPersonalFilter,
  fromGlobalId,
  getInfoEssence,
  getProjectionFromInfo,
  getSimpleProjectionFromInfo,
  transformAfter,
  toGlobalId,
};
