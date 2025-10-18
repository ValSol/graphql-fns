import { TangibleEntityConfig } from '@/tsTypes';
import type { PrepareBulkData } from '@/resolvers/tsTypes';

import processCreateInputData from '@/resolvers/mutations/processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  const preparedData = processCreateInputData(
    data,
    prevPreparedData,
    entityConfig as TangibleEntityConfig,
    'create',
  );

  return preparedData;
};

export default prepareBulkData;
