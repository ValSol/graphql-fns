// mongoose util

import createThingSchema from '@/mongooseModels/createThingSchema';
import initMongooseModels from '@/mongooseModels/initMongooseModels';

// build schema utils

import composeTypeDefsAndResolvers from '@/composeTypeDefsAndResolvers';
import composeManuallyCreatedResolvers from '@/composeManuallyCreatedResolvers';
import composeServersideConfig from '@/resolvers/utils/composeServersideConfig';
import composeAllEntityConfigs from '@/utils/composeAllEntityConfigs';
import composeCustom from '@/utils/composeCustom';
import composeRepresentations from '@/utils/composeRepresentations';
import composeRepresentationConfigByName from '@/utils/composeRepresentationConfigByName';
import pubsub from '@/resolvers/utils/pubsub';
import addChildActions from '@/utils/inventory/addChildActions';

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
import createEntityCountsQueryResolver from '@/resolvers/queries/createEntityCountsQueryResolver';
import createEntityExistencesQueryResolver from '@/resolvers/queries/createEntityExistencesQueryResolver';
import createEntityManyDistinctValuesQueryResolver from '@/resolvers/queries/createEntityManyDistinctValuesQueryResolver';
import createEntityQueryResolver from '@/resolvers/queries/createEntityQueryResolver';
import createEntitiesQueryResolver from '@/resolvers/queries/createEntitiesQueryResolver';
import createEntitiesByUniqueQueryResolver from '@/resolvers/queries/createEntitiesByUniqueQueryResolver';
import createEntitiesThroughConnectionQueryResolver from '@/resolvers/queries/createEntitiesThroughConnectionQueryResolver';

// subscription resolvers

import createCreatedEntitySubscriptionResolver from '@/resolvers/subscriptions/createCreatedEntitySubscriptionResolver';
import createUpdatedEntitySubscriptionResolver from '@/resolvers/subscriptions/createUpdatedEntitySubscriptionResolver';
import createDeletedEntitySubscriptionResolver from '@/resolvers/subscriptions/createDeletedEntitySubscriptionResolver';
import testSubscriptionNode from './resolvers/subscriptions/testSubscriptionNode';
import { composeSubscribePayloadMongoFilter } from './resolvers/utils/executeAuthorisation';

// graphql types utils

import composeCircleApproximatedByPolygon from './resolvers/mutations/processCreateInputData/composeCircleApproximatedByPolygon';
import lineStringFromGqlToMongo from './resolvers/mutations/processCreateInputData/lineStringFromGqlToMongo';
import lineStringFromMongoToGql from './resolvers/types/lineStringFromMongoToGql';
import multiLineStringFromGqlToMongo from './resolvers/mutations/processCreateInputData/multiLineStringFromGqlToMongo';
import multiLineStringFromMongoToGql from './resolvers/types/multiLineStringFromMongoToGql';
import multiPolygonFromGqlToMongo from '@/resolvers/mutations/processCreateInputData/multiPolygonFromGqlToMongo';
import multiPolygonFromMongoToGql from '@/resolvers/types/multiPolygonFromMongoToGql';
import pointFromGqlToMongo from '@/resolvers/mutations/processCreateInputData/pointFromGqlToMongo';
import pointFromMongoToGql from '@/resolvers/types/pointFromMongoToGql';
import polygonFromGqlToMongo from '@/resolvers/mutations/processCreateInputData/polygonFromGqlToMongo';
import polygonFromMongoToGql from '@/resolvers/types/polygonFromMongoToGql';

// utils

import adaptProjectionForCalculatedFields from '@/resolvers/utils/adaptProjectionForCalculatedFields';
import composeAllFieldsProjection from '@/resolvers/utils/composeAllFieldsProjection';
import composeFieldsObject, {
  FOR_MONGO_QUERY,
  WITHOUT_CALCULATED_WITH_ASYNC,
} from '@/utils/composeFieldsObject';
import composePersonalFilter from '@/resolvers/utils/executeAuthorisation/composePersonalFilter';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import composeUserFilter from '@/resolvers/utils/executeAuthorisation/composeUserFilter';
import composeSubscriptionReportArgs from '@/resolvers/utils/composeSubscriptionReportArgs';
import createInfoEssence from './resolvers/utils/createInfoEssence';
import getInfoEssence from './resolvers/utils/getInfoEssence';
import injectStaticOrPersonalFilter from '@/resolvers/utils/executeAuthorisation/injectStaticOrPersonalFilter';
import fromGlobalId from '@/resolvers/utils/fromGlobalId';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import getSimpleProjectionFromInfo from '@/resolvers/utils/getSimpleProjectionFromInfo';
import transformAfter from '@/resolvers/utils/resolverDecorator/transformAfter';
import toGlobalId from '@/resolvers/utils/toGlobalId';
import withSubscriptionReport from '@/resolvers/utils/withSubscriptionReport';

// types

export type * from '@/tsTypes';

// export all

export {
  adaptProjectionForCalculatedFields,
  addChildActions,
  createThingSchema,
  initMongooseModels,
  composeTypeDefsAndResolvers,
  composeManuallyCreatedResolvers,
  composeServersideConfig,
  composeAllEntityConfigs,
  composeCustom,
  composeRepresentations,
  composeRepresentationConfigByName,
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
  createUpdateFilteredEntitiesMutationResolver,
  createUpdateFilteredEntitiesReturnScalarMutationResolver,
  createUpdateManyEntitiesMutationResolver,
  createUpdateEntityMutationResolver,
  workOutMutations,
  createChildEntitiesThroughConnectionQueryResolver,
  createChildEntityCountQueryResolver,
  createEntityDistinctValuesQueryResolver,
  createEntityCountQueryResolver,
  createEntityCountsQueryResolver,
  createEntityExistencesQueryResolver,
  createEntityManyDistinctValuesQueryResolver,
  createEntityQueryResolver,
  createEntitiesQueryResolver,
  createEntitiesByUniqueQueryResolver,
  createEntitiesThroughConnectionQueryResolver,
  createCreatedEntitySubscriptionResolver, // why may be need to pass this?
  createUpdatedEntitySubscriptionResolver, // why may be need to pass this?
  createDeletedEntitySubscriptionResolver, // why may be need to pass this?
  testSubscriptionNode,
  composeSubscribePayloadMongoFilter,
  composeCircleApproximatedByPolygon,
  lineStringFromGqlToMongo,
  lineStringFromMongoToGql,
  multiLineStringFromGqlToMongo,
  multiLineStringFromMongoToGql,
  multiPolygonFromGqlToMongo,
  multiPolygonFromMongoToGql,
  pointFromGqlToMongo,
  pointFromMongoToGql,
  polygonFromGqlToMongo,
  polygonFromMongoToGql,
  pubsub,
  composeAllFieldsProjection,
  composeFieldsObject,
  composePersonalFilter,
  composeSubscriptionReportArgs,
  composeUserFilter,
  createInfoEssence,
  injectStaticOrPersonalFilter,
  fromGlobalId,
  getInfoEssence,
  getProjectionFromInfo,
  getSimpleProjectionFromInfo,
  transformAfter,
  toGlobalId,
  withSubscriptionReport,
  FOR_MONGO_QUERY,
  WITHOUT_CALCULATED_WITH_ASYNC,
};
