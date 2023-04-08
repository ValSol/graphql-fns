import type {ResolverAttributes} from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

const createEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'createEntity',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
};

export default createEntityResolverAttributes;
