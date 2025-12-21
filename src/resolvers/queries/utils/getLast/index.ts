import type { InvolvedFilter, ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import composeLastEdges from './composeLastEdges';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';

const getLast = async (
  _id: string,
  shift: number,
  last: number,
  resolverArg: ResolverArg,
  involvedFilters: {
    [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
  },
  entitiesQueryResolver: any,
  entityConfig: TangibleEntityConfig,
): null | Promise<any> => {
  const { parent, args, context, info } = resolverArg;

  const infoEssence = getInfoEssence(entityConfig, resolverArg.info, ['edges', 'node']);

  const firstForBefore = last + 2 > shift ? shift + 1 : last + 2;
  const skip = last + 2 > shift ? 0 : shift - last - 1;

  const pagination = { skip, first: firstForBefore } as const;

  const entities = await entitiesQueryResolver(
    parent,
    { ...args, pagination },
    context,
    infoEssence,
    { involvedFilters },
  );

  const { length } = entities;

  if (entities?.[length - 1]?.id?.toString() === _id) {
    return composeLastEdges(shift, last, entities);
  }

  return null;
};

export default getLast;
