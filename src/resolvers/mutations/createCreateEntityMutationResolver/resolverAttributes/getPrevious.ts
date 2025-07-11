import type { GetPrevious } from '../../../tsTypes';

import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import checkData from '../../checkData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const { involvedFilters } = resolverArg;

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
