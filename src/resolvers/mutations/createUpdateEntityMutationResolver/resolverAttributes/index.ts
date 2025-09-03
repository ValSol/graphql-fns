import type { ResolverAttributes } from '@/resolvers/tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

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
