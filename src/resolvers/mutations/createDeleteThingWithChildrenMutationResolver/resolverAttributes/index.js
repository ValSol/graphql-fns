// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from '../../createDeleteThingMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from './prepareBulkData';

const deleteThingWithChildrenResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteThingWithChildren',
  array: false,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous: [previous] }) => previous,
};

export default deleteThingWithChildrenResolverAttributes;
