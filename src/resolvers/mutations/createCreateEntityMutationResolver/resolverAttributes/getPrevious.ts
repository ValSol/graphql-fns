import type { GetPrevious } from '@/resolvers/tsTypes';

import getFilterFromInvolvedFilters from '@/resolvers/utils/getFilterFromInvolvedFilters';
import checkData from '@/resolvers/mutations/checkData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const {
    resolverOptions: { involvedFilters },
  } = resolverArg;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const processingKind = 'create';
  const allowCreate = await checkData(
    resolverCreatorArg,
    resolverArg,
    filter,
    processingKind,
    session,
  );

  return allowCreate && [];
};

export default getPrevious;
