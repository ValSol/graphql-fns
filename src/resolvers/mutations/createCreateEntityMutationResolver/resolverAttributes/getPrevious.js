// @flow

import type { GetPrevious } from '../../../flowTypes';

import checkData from '../../checkData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;
  const { args, context, parentFilters } = resolverArg;

  const { mainEntity: filter } = parentFilters;

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

export default get;
