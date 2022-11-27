// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createDeleteFilteredEntitiesMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteEntityWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredEntitiesWithChildrenResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredEntitiesWithChildren',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteFilteredEntitiesWithChildrenResolverAttributes;
