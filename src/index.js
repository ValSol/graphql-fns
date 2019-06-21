import composeGqlTypes from './types/composeGqlTypes';
import composeGqlResolvers from './resolvers/composeGqlResolvers';
import Admin from './admin/components/Admin';
import composeMutation from './client/mutations/composeMutation';
import composeQuery from './client/queries/composeQuery';
import composeSubscription from './client/subscriptions/composeSubscription';

export default {
  // server side
  composeGqlResolvers,
  composeGqlTypes,
  // client side
  composeMutation,
  composeQuery,
  composeSubscription,
  // client side admin
  Admin,
};
