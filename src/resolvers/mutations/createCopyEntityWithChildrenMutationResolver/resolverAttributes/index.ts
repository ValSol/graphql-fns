import type { ResolverAttributes } from '../../../tsTypes';

import getPrevious from '../../createCopyEntityMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from './prepareBulkData';

const createEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyEntityWithChildren',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: () => null,
  finalResult: ({ current: [current] }) => current,
};

export default createEntityResolverAttributes;
