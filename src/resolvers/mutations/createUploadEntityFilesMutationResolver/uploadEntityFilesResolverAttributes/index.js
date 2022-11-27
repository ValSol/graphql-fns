// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import loophole from './loophole';

const createManyEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'uploadEntityFiles',
  loophole,
  array: true,
};

export default createManyEntitiesResolverAttributes;
