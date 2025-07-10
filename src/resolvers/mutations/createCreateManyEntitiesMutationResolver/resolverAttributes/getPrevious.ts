import type { GraphqlObject } from '../../../../tsTypes';
import type { GetPrevious } from '../../../tsTypes';

import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import checkData from '../../checkData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, involvedFilters } = resolverArg;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) {
    return null;
  }

  const { data } = args as { data: GraphqlObject[] };
  const processingKind = 'create';
  for (let i = 0; i < data.length; i += 1) {
    const allowCreate = await checkData(
      { data: data[i] },
      filter,
      entityConfig,
      processingKind,
      generalConfig,
      serversideConfig,
      context,
    );

    if (!allowCreate) return null;
  }

  return filter && [];
};

export default getPrevious;
