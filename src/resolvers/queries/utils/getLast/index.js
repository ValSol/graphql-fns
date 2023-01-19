// @flow

import type { ResolverArg } from '../../../flowTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeLastEdges from './composeLastEdges';

const getLast = async (
  _id: string,
  shift: number,
  last: number,
  resolverArg: ResolverArg,
  involvedFilters: { [derivativeConfigName: string]: null | Array<Object> },
  entitiesQueryResolver: Function,
): null | Promise<Object> => {
  const { parent, args, context, info } = resolverArg;

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const firstForBefore = last + 2 > shift ? shift + 1 : last + 2;
  const skip = last + 2 > shift ? 0 : shift - last - 1;

  const pagination = { skip, first: firstForBefore };

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    { projection },
    involvedFilters,
  );

  const { length } = entities;

  // eslint-disable-next-line no-underscore-dangle
  if (entities?.[length - 1]?.id?.toString() === _id) {
    return composeLastEdges(shift, last, entities);
  }

  return null;
};

export default getLast;
