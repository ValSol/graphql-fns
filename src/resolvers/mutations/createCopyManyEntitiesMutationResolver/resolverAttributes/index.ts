import type { ResolverAttributes } from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from '../../createCopyEntityMutationResolver/resolverAttributes/prepareBulkData';

const createEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyManyEntities',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: () => null,
  finalResult: ({ current }) => current,
};

export default createEntityResolverAttributes;
