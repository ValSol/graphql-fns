import type {ResolverAttributes} from '../../../tsTypes';

import loophole from './loophole';

const createManyEntitiesResolverAttributes: ResolverAttributes = {
  actionGeneralName: 'uploadEntityFiles',
  loophole,
  array: true,
};

export default createManyEntitiesResolverAttributes;
