// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { thingConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  const preparedData = processCreateInputData(data, prevPreparedData, thingConfig, 'create');

  return preparedData;
};

export default prepareBulkData;
