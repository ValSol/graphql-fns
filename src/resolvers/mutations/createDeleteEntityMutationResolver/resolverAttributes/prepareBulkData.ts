import type { DataObject, TangibleEntityConfig } from '../../../../tsTypes';
import type { PrepareBulkData } from '../../../tsTypes';

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
    core = processDeleteData(
      entity,
      core as Map<TangibleEntityConfig, Array<DataObject>>,
      entityConfig as TangibleEntityConfig,
      toDelete,
    );
  });

  return { ...prevPreparedData, core };
};

export default prepareBulkData;
