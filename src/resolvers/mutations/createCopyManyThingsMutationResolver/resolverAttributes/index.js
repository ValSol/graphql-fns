// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from '../../createCopyThingMutationResolver/resolverAttributes/prepareBulkData';
import report from './report';

const createThingResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyManyThings',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
};

export default createThingResolverAttributes;
