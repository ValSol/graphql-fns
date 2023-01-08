// @flow

import type { ResolverArg } from '../../../flowTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';

const getFirst = async (
  _id: string,
  shift: number,
  first: number,
  resolverArg: ResolverArg,
  parentFilters: Object,
  entitiesQueryResolver: Function,
): null | Promise<Object> => {
  const { parent, args, context, info } = resolverArg;

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const pagination = { skip: shift, first: first + 2 };

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    { projection },
    parentFilters,
  );

  // eslint-disable-next-line no-underscore-dangle
  if (entities?.[0]?.id?.toString() === _id) {
    return composeFirstEdges(shift, first, entities);
  }

  return null;
};

export default getFirst;
