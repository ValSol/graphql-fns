import type { GetPrevious } from '../../../tsTypes';

import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import checkData from '../../checkData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) return null;

  const processingKind = 'create';
  const allowCreate = await checkData(
    args,
    filter,
    entityConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  return allowCreate && [];
};

export default getPrevious;
