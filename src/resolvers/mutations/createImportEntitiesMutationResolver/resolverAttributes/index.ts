import type {ResolverAttributes} from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const importEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'importEntities',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default importEntitiesResolverAttributes;
