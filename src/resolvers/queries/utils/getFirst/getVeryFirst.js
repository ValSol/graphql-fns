// @flow

import type { ResolverArg } from '../../../flowTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';

const getVeryFirst = async (
  first: number,
  resolverArg: ResolverArg,
  parentFilters: Object,
  entitiesQueryResolver: Function,
): null | Promise<Object> => {
  const { parent, args, context, info } = resolverArg;

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const pagination = { skip: 0, first: first + 1 };

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    { projection },
    parentFilters,
  );

  const shift = -1;

  return composeFirstEdges(shift, first, entities);
};

export default getVeryFirst;
