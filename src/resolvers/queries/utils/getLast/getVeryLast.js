// @flow

import type { ResolverArg } from '../../../flowTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeLastEdges from './composeLastEdges';

const getVeryLast = async (
  last: number,
  resolverArg: ResolverArg,
  filter: Object,
  entitiesQueryResolver: Function,
  entityCountQueryResolver: Function,
): null | Promise<Object> => {
  const { parent, args, context, info } = resolverArg;

  const count = await entityCountQueryResolver(
    parent,
    args,
    context,
    { projection: { _id: 1 } },
    filter,
  );

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const pagination = { skip: count - last - 1 };

  const entities = await entitiesQueryResolver(
    parent,
    last < count ? { ...args, pagination } : args,
    context,
    { projection },
    filter,
  );

  return composeLastEdges(-count, last, entities);
};

export default getVeryLast;