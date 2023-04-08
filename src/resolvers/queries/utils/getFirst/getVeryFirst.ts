import type {ResolverArg} from '../../../tsTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';

const getVeryFirst = async (
  first: number,
  resolverArg: ResolverArg,
  involvedFilters: {
    [derivativeConfigName: string]: null | Array<any>
  },
  entitiesQueryResolver: any,
): null | Promise<any> => {
  const { parent, args, context, info } = resolverArg;

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const pagination = { skip: 0, first: first + 1 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    { projection },
    involvedFilters,
  );

  const shift = -1;

  return composeFirstEdges(shift, first, entities);
};

export default getVeryFirst;
