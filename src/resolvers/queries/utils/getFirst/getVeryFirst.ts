import {
  InvolvedFilter,
  GraphqlScalar,
  GraphqlObject,
  ResolverArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import composeFirstEdges from './composeFirstEdges';

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

  const infoEssence = getInfoEssence(entityConfig, resolverArg.info, ['edges', 'node']);

  const pagination = { skip: 0, first: first + 1 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    infoEssence,
    { involvedFilters },
  );

  const shift = -1;

  return composeFirstEdges(shift, first, entities);
};

export default getVeryFirst;
