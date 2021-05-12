// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

const deleteManyThingsResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'deleteThing',
  array: true,
  getPrevious,
  produceCurrent: false,
  prepareBulkData,
  report,
  finalResult: ({ previous: [previous] }) => previous,
};

export default deleteManyThingsResolverAttributes;
