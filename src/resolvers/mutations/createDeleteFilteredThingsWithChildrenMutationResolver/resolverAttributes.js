// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createDeleteFilteredThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteThingWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const deleteFilteredThingsResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredThingsWithChildren',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteFilteredThingsResolverAttributes;
