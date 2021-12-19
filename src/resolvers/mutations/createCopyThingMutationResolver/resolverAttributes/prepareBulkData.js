// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { thingConfig } = resolverCreatorArg;

  const {
    mains: [data],
  } = prevPreparedData;

  if (data.id) {
    return processCreateInputData(data, { ...prevPreparedData, mains: [] }, thingConfig, 'update');
  }

  return processCreateInputData(data, { ...prevPreparedData, mains: [] }, thingConfig, 'create');
};

export default prepareBulkData;
