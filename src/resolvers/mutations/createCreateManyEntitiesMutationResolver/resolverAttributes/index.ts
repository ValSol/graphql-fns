import type { ResolverAttributes } from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const createManyEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'createManyEntities',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: () => null,
  finalResult: ({ current }) => current,
};

export default createManyEntitiesResolverAttributes;
