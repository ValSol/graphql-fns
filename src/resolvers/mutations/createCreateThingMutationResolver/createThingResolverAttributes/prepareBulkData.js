// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (resolverCreatorArg, resolverArg) => {
  const { thingConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  const preparedData = processCreateInputData(data, [], null, null, thingConfig, 'create');

  return preparedData;
};

export default prepareBulkData;
