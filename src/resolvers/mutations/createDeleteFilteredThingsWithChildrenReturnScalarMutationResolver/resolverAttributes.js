// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createDeleteFilteredThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteThingWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredThingsReturnScalarResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredThingsWithChildrenReturnScalar',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous.length,
};

export default deleteFilteredThingsReturnScalarResolverAttributes;
