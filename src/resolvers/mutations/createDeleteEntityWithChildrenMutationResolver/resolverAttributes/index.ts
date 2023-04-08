import type {ResolverAttributes} from '../../../tsTypes';

import getPrevious from '../../createDeleteEntityMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from './prepareBulkData';

const deleteEntityWithChildrenResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteEntityWithChildren',
  array: false,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous: [previous] }) => previous,
};

export default deleteEntityWithChildrenResolverAttributes;
