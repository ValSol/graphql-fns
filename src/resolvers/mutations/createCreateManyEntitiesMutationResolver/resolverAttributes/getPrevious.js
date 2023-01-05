// @flow
import type { GetPrevious } from '../../../flowTypes';

import checkData from '../../checkData';

const getPrevious: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, parentFilters } = resolverArg;

  const { mainEntity: filter } = parentFilters;

  if (!filter) {
    return null;
  }

  const { data } = args;
  const processingKind = 'create';
  for (let i = 0; i < data.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
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
