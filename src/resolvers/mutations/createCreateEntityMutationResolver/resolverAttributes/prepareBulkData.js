// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  const preparedData = processCreateInputData(data, prevPreparedData, entityConfig, 'create');

  return preparedData;
};

export default prepareBulkData;
