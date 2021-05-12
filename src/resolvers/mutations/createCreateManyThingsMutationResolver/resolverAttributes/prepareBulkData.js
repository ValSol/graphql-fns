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

  let preparedData = prevPreparedData;

  data.forEach((dataItem) => {
    preparedData = processCreateInputData(dataItem, preparedData, thingConfig, 'create');
  });

  return preparedData;
};

export default prepareBulkData;
