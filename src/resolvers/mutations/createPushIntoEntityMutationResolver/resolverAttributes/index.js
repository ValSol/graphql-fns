// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

const pushIntoEntityResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'pushIntoEntity',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
};

export default pushIntoEntityResolverAttributes;
