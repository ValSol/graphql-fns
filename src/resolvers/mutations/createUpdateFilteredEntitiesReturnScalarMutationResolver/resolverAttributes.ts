import type {ResolverAttributes} from '../../tsTypes';

import getPrevious from '../createUpdateFilteredEntitiesMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createUpdateEntityMutationResolver/resolverAttributes/prepareBulkData';

const updateFilteredEntitiesReturnScalarResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'updateFilteredEntitiesReturnScalar',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current.length,
};

export default updateFilteredEntitiesReturnScalarResolverAttributes;
