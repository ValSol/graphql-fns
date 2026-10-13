import type { PrepareBulkData } from '@/resolvers/tsTypes';

import createEntityPrepareBulkData from '../../createCreateEntityMutationResolver/resolverAttributes/prepareBulkData';
import composeDataToCreate from './composeDataToCreate';

const prepareBulkData: PrepareBulkData = (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
  session,
) => {
  // entity is found: nothing to write
  if (prevPreparedData.mains.length > 0) return prevPreparedData;

  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  return createEntityPrepareBulkData(
    resolverCreatorArg,
    { ...resolverArg, args: { ...args, data: composeDataToCreate(args, entityConfig) } },
    prevPreparedData,
    session,
  );
};

export default prepareBulkData;
