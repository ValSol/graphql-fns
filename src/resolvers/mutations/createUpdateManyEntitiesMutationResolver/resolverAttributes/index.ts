import type {ResolverAttributes} from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const updateManyEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'updateManyEntities',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default updateManyEntitiesResolverAttributes;
