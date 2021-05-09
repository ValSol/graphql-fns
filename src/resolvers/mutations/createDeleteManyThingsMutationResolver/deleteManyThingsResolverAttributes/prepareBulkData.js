// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processDeleteData from '../../processDeleteData';

const prepareBulkData: PrepareBulkData = async (resolverCreatorArg, resolverArg, previous) => {
  const { thingConfig } = resolverCreatorArg;

  const toDelete = true;
  let core = new Map();
  previous.forEach((thing) => {
    core = processDeleteData(thing, core, thingConfig, toDelete);
  });

  const periphery = new Map();

  const mains = previous.map(({ _id }) => _id);

  return { core, periphery, mains };
};

export default prepareBulkData;
