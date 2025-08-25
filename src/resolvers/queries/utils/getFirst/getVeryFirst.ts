import {
  InvolvedFilter,
  GraphqlScalar,
  GraphqlObject,
  ResolverArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';

const getVeryFirst = async (
  first: number,
  resolverArg: ResolverArg,
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entitiesQueryResolver: any,
  entityConfig: TangibleEntityConfig,
): null | Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
  const { parent, args, context } = resolverArg;

  const projection = getProjectionFromInfo(entityConfig, resolverArg, ['edges', 'node']);

  const pagination = { skip: 0, first: first + 1 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    createInfoEssence(projection),
    { involvedFilters },
  );

  const shift = -1;

  return composeFirstEdges(shift, first, entities);
};

export default getVeryFirst;
