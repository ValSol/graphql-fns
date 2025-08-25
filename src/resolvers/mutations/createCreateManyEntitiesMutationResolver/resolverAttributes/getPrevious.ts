import type { GraphqlObject } from '../../../../tsTypes';
import type { GetPrevious } from '../../../tsTypes';

import getFilterFromInvolvedFilters from '../../../utils/getFilterFromInvolvedFilters';
import checkData from '../../checkData';

const getPrevious: GetPrevious = async (
  actionGeneralName,
  resolverCreatorArg,
  resolverArg,
  session,
) => {
  const {
    args,
    resolverOptions: { involvedFilters },
  } = resolverArg;

  const { filter } = getFilterFromInvolvedFilters(involvedFilters);

  if (!filter) {
    return null;
  }

  const { data } = args as { data: GraphqlObject[] };
  const processingKind = 'create';
  for (let i = 0; i < data.length; i += 1) {
    const allowCreate = await checkData(
      resolverCreatorArg,
      { ...resolverArg, args: { data: data[i] } },
      filter,
      processingKind,
      session,
    );

    if (!allowCreate) return null;
  }

  return filter && [];
};

export default getPrevious;
