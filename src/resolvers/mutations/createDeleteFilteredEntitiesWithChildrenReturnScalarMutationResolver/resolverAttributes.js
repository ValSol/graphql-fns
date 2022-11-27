// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createDeleteFilteredEntitiesMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteEntityWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredEntitiesWithChildrenReturnScalarResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredEntitiesWithChildrenReturnScalar',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous.length,
};

export default deleteFilteredEntitiesWithChildrenReturnScalarResolverAttributes;
