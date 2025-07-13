import type { GraphqlObject, TangibleEntityConfig } from '../../../../tsTypes';
import type { PrepareBulkData } from '../../../tsTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data, positions } = args as { data: GraphqlObject; positions?: number[] };

  const {
    mains: [previousEntity],
  } = prevPreparedData;

  const preparedData = processCreateInputData(
    { ...data, id: previousEntity._id },
    { ...prevPreparedData, mains: [] },
    entityConfig as TangibleEntityConfig,
    'push',
    positions,
  );

  return preparedData;
};

export default prepareBulkData;
