// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

const deleteEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteEntity',
  array: false,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report,
  finalResult: ({ previous: [previous] }) => previous,
};

export default deleteEntityResolverAttributes;
