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

  const { data, positions } = args;

  const {
    mains: [previousEntity],
  } = prevPreparedData;

  const preparedData = processCreateInputData(
    { ...data, id: previousEntity._id }, // eslint-disable-line no-underscore-dangle
    { ...prevPreparedData, mains: [] },
    entityConfig,
    'push',
    positions,
  );

  return preparedData;
};

export default prepareBulkData;
