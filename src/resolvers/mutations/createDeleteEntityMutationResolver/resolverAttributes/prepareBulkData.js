// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processDeleteData from '../../processDeleteData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg;

  const toDelete = true;
  let { core } = prevPreparedData;
  const { mains } = prevPreparedData;
  mains.forEach((entity) => {
    core = processDeleteData(entity, core, entityConfig, toDelete);
  });

  return { ...prevPreparedData, core };
};

export default prepareBulkData;
