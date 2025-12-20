import {
  GraphqlScalar,
  GraphqlObject,
  InvolvedFilter,
  ResolverArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getProjectionFromInfo from '@/resolvers/utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';

const getFirst = async (
  _id: string,
  shift: number,
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

  const pagination = { skip: shift, first: first + 2 } as const;

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    createInfoEssence({ projection }),
    { involvedFilters },
  );

  if (entities?.[0]?.id?.toString() === _id) {
    return composeFirstEdges(shift, first, entities);
  }

  return null;
};

export default getFirst;
