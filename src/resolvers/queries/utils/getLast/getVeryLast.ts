import type { ResolverArg } from '../../../tsTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeLastEdges from './composeLastEdges';
import { InvolvedFilter, GraphqlScalar, GraphqlObject } from '../../../../tsTypes';

const getVeryLast = async (
  last: number,
  resolverArg: ResolverArg,
  involvedFilters: {
    [derivativeConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entitiesQueryResolver: any,
  entityCountQueryResolver: any,
): null | Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
  const { parent, args, context, info } = resolverArg;

  const { inputOutputEntity } = involvedFilters;

  const count = await entityCountQueryResolver(
    parent,
    args,
    context,
    { projection: { _id: 1 } },
    { inputOutputEntity },
  );

  const projection = getProjectionFromInfo(info, ['edges', 'node']);

  const pagination = { skip: count - last - 1 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    last < count ? { ...args, pagination } : args,
    context,
    { projection },
    involvedFilters,
  );

  return composeLastEdges(-count, last, entities);
};

export default getVeryLast;
