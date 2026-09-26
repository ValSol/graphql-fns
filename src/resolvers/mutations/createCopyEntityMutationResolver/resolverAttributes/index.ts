import type { ResolverAttributes } from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const createEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyEntity',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: () => null,
  finalResult: ({ current: [current] }) => current,
};

export default createEntityResolverAttributes;
