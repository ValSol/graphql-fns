import type { ResolverAttributes } from '@/resolvers/tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const getOrCreateManyEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'getOrCreateManyEntities',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: () => null, // as "createManyEntities" it doesn't publish "created" events
  finalResult: ({ current }) => current,
  // entity created concurrently by other request: try again to get it
  retryOnDuplicateKey: true,
};

export default getOrCreateManyEntitiesResolverAttributes;
