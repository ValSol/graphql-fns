import {
  InvolvedFilter,
  GraphqlScalar,
  GraphqlObject,
  ResolverArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import composeLastEdges from './composeLastEdges';

const getVeryLast = async (
  last: number,
  resolverArg: ResolverArg,
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entitiesQueryResolver: any,
  entityCountQueryResolver: any,
  entityConfig: TangibleEntityConfig,
): null | Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
  const { parent, args, context } = resolverArg;

  const { inputOutputEntity } = involvedFilters;

  const count = await entityCountQueryResolver(
    parent,
    args,
    context,
    createInfoEssence({ _id: 1 }),
    { involvedFilters: { inputOutputEntity } },
  );

  const projection = getProjectionFromInfo(entityConfig, resolverArg, ['edges', 'node']);

  const pagination = { skip: count - last - 1 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    last < count ? { ...args, pagination } : args,
    context,
    createInfoEssence(projection),
    { involvedFilters },
  );

  return composeLastEdges(-count, last, entities);
};

export default getVeryLast;
