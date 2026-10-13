import type { ResolverAttributes } from '@/resolvers/tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

const getOrCreateEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'getOrCreateEntity',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
  // entity created concurrently by other request: try again to get it
  retryOnDuplicateKey: true,
};

export default getOrCreateEntityResolverAttributes;
