// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import getPrevious from './getPrevious';
import prepareBulkData from './prepareBulkData';
import report from './report';

const updateThingResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'uploadFilesToThing',
  array: false,
  getPrevious,
  produceCurrent: true,
  prepareBulkData,
  report,
  finalResult: ({ current: [current] }) => current,
};

export default updateThingResolverAttributes;
