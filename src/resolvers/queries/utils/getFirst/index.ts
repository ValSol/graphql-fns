import type {ResolverArg} from '../../../tsTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';

const getFirst = async (
  _id: string,
  shift: number,
  first: number,
  resolverArg: ResolverArg,
  involvedFilters: {
    [derivativeConfigName: string]: null | Array<any>
  },
  entitiesQueryResolver: any,
): null | Promise<any> => {
  const { parent, args, context, info } = resolverArg;

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const pagination = { skip: shift, first: first + 2 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    { projection },
    involvedFilters,
  );

  // eslint-disable-next-line no-underscore-dangle
  if (entities?.[0]?.id?.toString() === _id) {
    return composeFirstEdges(shift, first, entities);
  }

  return null;
};

export default getFirst;
