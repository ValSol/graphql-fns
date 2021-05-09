// @flow

import type { ResolverAttributes } from '../../../flowTypes';

import loophole from './loophole';

const createManyThingsResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'uploadThingFiles',
  loophole,
  array: true,
};

export default createManyThingsResolverAttributes;
