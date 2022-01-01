// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from '../../createCopyManyThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../../createCopyThingWithChildrenMutationResolver/resolverAttributes/prepareBulkData';

const createThingResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyManyThingsWithChildren',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default createThingResolverAttributes;
