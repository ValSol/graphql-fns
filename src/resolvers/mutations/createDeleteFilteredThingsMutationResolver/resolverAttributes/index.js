// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';

const deleteFilteredThingsResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteFilteredThings',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report: async () => null,
  finalResult: ({ previous }) => previous,
};

export default deleteFilteredThingsResolverAttributes;
