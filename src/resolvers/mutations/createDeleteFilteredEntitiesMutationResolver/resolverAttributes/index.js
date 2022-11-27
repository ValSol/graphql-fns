// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from '../../createDeleteEntityMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredEntities',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteFilteredEntitiesResolverAttributes;
