// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from '../../createUpdateEntityMutationResolver/resolverAttributes/prepareBulkData';

const updateFilteredEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'updateFilteredEntities',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default updateFilteredEntitiesResolverAttributes;
