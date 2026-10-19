import type { InvolvedFilter } from '@/tsTypes';
import type { GetPrevious } from '@/resolvers/tsTypes';

import checkData from '@/resolvers/mutations/checkData';
import checkWhereOneArgs from '@/resolvers/utils/checkWhereOneArgs';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import composeDataToCreate from '../../createGetOrCreateEntityMutationResolver/resolverAttributes/composeDataToCreate';
import composeItems from './composeItems';
import findEntities from './findEntities';
import foundItemsByResolverArg from './foundItemsByResolverArg';

// return found entities (in the order of items) after checking that all not found entities may be created
const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const { entityConfig } = resolverCreatorArg;
  const {
    args,
    resolverOptions: { involvedFilters },
  } = resolverArg;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const items = composeItems(args);

  items.forEach(({ whereOne, whereCompoundOne }) => {
    checkWhereOneArgs(whereOne as any, whereCompoundOne as any, entityConfig);
  });

  const foundItems: boolean[] = [];
  const previous: Record<string, any>[] = [];

  // all entities are searched by one query
  const entities = await findEntities(
    items.map(({ whereOne, whereCompoundOne }) => (whereOne || whereCompoundOne) as InvolvedFilter),
    filter,
    resolverCreatorArg,
    resolverArg,
    session,
  );

  for (let i = 0; i < items.length; i += 1) {
    const entity = entities[i];

    foundItems.push(Boolean(entity));

    if (entity) {
      previous.push(entity);
    } else {
      // not found: entity with "data" (completed by "whereOne" / "whereCompoundOne") has to be...
      // ... allowed to create
      const allowCreate = await checkData(
        resolverCreatorArg,
        { ...resolverArg, args: { data: composeDataToCreate(items[i], entityConfig) } },
        filter,
        'create',
        session,
      );

      if (!allowCreate) return null;
    }
  }

  foundItemsByResolverArg.set(resolverArg, foundItems);

  return previous;
};

export default getPrevious;
