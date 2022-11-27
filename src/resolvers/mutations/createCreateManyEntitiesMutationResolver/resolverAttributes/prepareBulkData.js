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

  let preparedData = prevPreparedData;

  data.forEach((dataItem) => {
    preparedData = processCreateInputData(dataItem, preparedData, entityConfig, 'create');
  });

  return preparedData;
};

export default prepareBulkData;
