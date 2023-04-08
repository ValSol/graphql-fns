import type {ResolverAttributes} from '../../tsTypes';

import getPrevious from '../createDeleteManyEntitiesMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteEntityWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const deleteManysResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteManyEntitiesWithChildren',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteManysResolverAttributes;
