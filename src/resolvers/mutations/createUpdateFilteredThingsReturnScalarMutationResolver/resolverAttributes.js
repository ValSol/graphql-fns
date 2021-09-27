// @flow

import type { ResolverAttributes } from '../../flowTypes';

import getPrevious from '../createUpdateFilteredThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../createUpdateFilteredThingsMutationResolver/resolverAttributes/prepareBulkData';

const updateFilteredThingsReturnScalarResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'updateFilteredThingsReturnScalar',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current.length,
};

export default updateFilteredThingsReturnScalarResolverAttributes;
