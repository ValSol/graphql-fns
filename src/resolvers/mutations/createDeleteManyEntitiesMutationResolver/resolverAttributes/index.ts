import type {ResolverAttributes} from '../../../tsTypes';

import getPrevious from './getPrevious';
import prepareBulkData from '../../createDeleteEntityMutationResolver/resolverAttributes/prepareBulkData';

const deleteManyEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteManyEntities',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteManyEntitiesResolverAttributes;
