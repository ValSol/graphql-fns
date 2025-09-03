import type { ResolverAttributes } from '@/resolvers/tsTypes';

import report from '@/resolvers/mutations/createUpdateEntityMutationResolver/resolverAttributes/report';
import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const updateEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'updateEntity',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
};

export default updateEntityResolverAttributes;
