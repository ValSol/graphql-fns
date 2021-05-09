// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (resolverCreatorArg, resolverArg) => {
  const { thingConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  let preparedData = {
    core: new Map(),
    periphery: new Map(),
    mains: [],
  };

  data.forEach((dataItem) => {
    preparedData = processCreateInputData(
      dataItem,
      preparedData.mains,
      preparedData.core,
      preparedData.periphery,
      thingConfig,
      'create',
    );
  });

  return preparedData;
};

export default prepareBulkData;
