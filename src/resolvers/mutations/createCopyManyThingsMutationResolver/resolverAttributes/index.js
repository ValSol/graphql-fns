// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from '../../createCopyThingMutationResolver/resolverAttributes/prepareBulkData';

const createThingResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyManyThings',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default createThingResolverAttributes;
