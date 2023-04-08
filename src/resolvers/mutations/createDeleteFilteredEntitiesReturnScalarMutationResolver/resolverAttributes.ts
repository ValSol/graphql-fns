import type {ResolverAttributes} from '../../tsTypes';

import getPrevious from '../createDeleteFilteredEntitiesMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteEntityMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredEntitiesReturnScalarResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredEntitiesReturnScalar',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous.length,
};

export default deleteFilteredEntitiesReturnScalarResolverAttributes;
