// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createDeleteManyThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createDeleteThingWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const deleteManyThingsResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteManyThingsWithChildren',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteManyThingsResolverAttributes;
