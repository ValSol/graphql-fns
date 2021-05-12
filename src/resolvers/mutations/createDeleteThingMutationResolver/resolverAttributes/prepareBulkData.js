// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processDeleteData from '../../processDeleteData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { thingConfig } = resolverCreatorArg;

  const toDelete = true;
  let { core } = prevPreparedData;
  const { mains } = prevPreparedData;
  mains.forEach((thing) => {
    core = processDeleteData(thing, core, thingConfig, toDelete);
  });

  return { ...prevPreparedData, core };
};

export default prepareBulkData;
