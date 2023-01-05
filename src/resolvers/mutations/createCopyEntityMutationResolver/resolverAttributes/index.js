// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const createEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'copyEntity',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current: [current] }) => current,
};

export default createEntityResolverAttributes;
