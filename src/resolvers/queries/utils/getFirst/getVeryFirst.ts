import type { ResolverArg } from '../../../../tsTypes';

import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import composeFirstEdges from './composeFirstEdges';
import {
  InvolvedFilter,
  GraphqlScalar,
  GraphqlObject,
  TangibleEntityConfig,
} from '../../../../tsTypes';

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
    { projection },
    involvedFilters,
  );

  const shift = -1;

  return composeFirstEdges(shift, first, entities);
};

export default getVeryFirst;
