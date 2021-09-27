// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createDeleteFilteredThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteFilteredThingsMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredThingsReturnScalarResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredThingsReturnScalar',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous.length,
};

export default deleteFilteredThingsReturnScalarResolverAttributes;
