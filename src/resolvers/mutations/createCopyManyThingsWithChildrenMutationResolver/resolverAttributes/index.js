// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from '../../createCopyManyThingsMutationResolver/resolverAttributes/getPrevious';
import prepareBulkData from '../../createCopyThingWithChildrenMutationResolver/resolverAttributes/prepareBulkData';
import report from './report';

const createThingResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyManyThingsWithChildren',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
};

export default createThingResolverAttributes;
