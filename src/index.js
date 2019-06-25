// @flow

// -----------
// server side
// -----------

export { default as composeGqlResolvers } from './resolvers/composeGqlResolvers';
export { default as composeGqlTypes } from './types/composeGqlTypes';

// mutation resolvers
export {
  default as createCreateManyThingsMutationResolver,
} from './resolvers/mutations/createCreateManyThingsMutationResolver';
export {
  default as createCreateThingMutationResolver,
} from './resolvers/mutations/createCreateThingMutationResolver';
export {
  default as createUpdateThingMutationResolver,
} from './resolvers/mutations/createUpdateThingMutationResolver';
export {
  default as createDeleteThingMutationResolver,
} from './resolvers/mutations/createDeleteThingMutationResolver';

// query resolvers
export {
  default as createThingCountQueryResolver,
} from './resolvers/queries/createThingCountQueryResolver';
export { default as createThingQueryResolver } from './resolvers/queries/createThingQueryResolver';
export {
  default as createThingsQueryResolver,
} from './resolvers/queries/createThingsQueryResolver';

// subscription resolvers
export {
  default as createCreatedThingSubscriptionResolver,
} from './resolvers/subscriptions/createCreatedThingSubscriptionResolver';
export {
  default as createUpdatedThingSubscriptionResolver,
} from './resolvers/subscriptions/createUpdatedThingSubscriptionResolver';
export {
  default as createDeletedThingSubscriptionResolver,
} from './resolvers/subscriptions/createDeletedThingSubscriptionResolver';

// -----------
// client side
// -----------

export { default as composeMutation } from './client/mutations/composeMutation';
export { default as composeQuery } from './client/queries/composeQuery';
export { default as composeSubscription } from './client/subscriptions/composeSubscription';

// admin
export { default as Admin } from './admin/components/Admin';
