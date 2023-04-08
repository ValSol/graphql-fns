import type {ResolverAttributes} from '../../../tsTypes';

import getPrevious from '../../createCopyManyEntitiesMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../../createCopyEntityWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const createEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyManyEntitiesWithChildren',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default createEntityResolverAttributes;
