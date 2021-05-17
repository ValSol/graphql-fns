// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const updateThingResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'updateManyThings',
  array: true,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ current }) => current,
};

export default updateThingResolverAttributes;
