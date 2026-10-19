import type { GetPrevious } from '@/resolvers/tsTypes';

import checkWhereOneArgs from '@/resolvers/utils/checkWhereOneArgs';
import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import createEntityGetPrevious from '../../createCreateEntityMutationResolver/resolverAttributes/getPrevious';
import composeDataToCreate from './composeDataToCreate';
import findEntity from './findEntity';

// return found entity (as "entity" query does) or "[]" if entity has to be created
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

  const { whereOne, whereCompoundOne } = args as Record<string, any>;

  checkWhereOneArgs(whereOne, whereCompoundOne, entityConfig);

  const previousEntity = await findEntity(
    whereOne || whereCompoundOne,
    filter,
    resolverCreatorArg,
    resolverArg,
    session,
  );

  if (previousEntity) return [previousEntity];

  // not found: check that entity with "data" (completed by "whereOne" / "whereCompoundOne")...
  // ... may be created
  return createEntityGetPrevious(
    actionGeneralName,
    resolverCreatorArg,
    { ...resolverArg, args: { ...args, data: composeDataToCreate(args, entityConfig) } },
    session,
  );
};

export default getPrevious;
