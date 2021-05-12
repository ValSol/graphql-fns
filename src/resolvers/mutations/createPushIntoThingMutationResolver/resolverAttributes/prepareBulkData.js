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

  const { data, positions } = args;

  const {
    mains: [previousThing],
  } = prevPreparedData;

  const preparedData = processCreateInputData(
    { ...data, id: previousThing._id }, // eslint-disable-line no-underscore-dangle
    prevPreparedData,
    thingConfig,
    'push',
    positions,
  );

  return preparedData;
};

export default prepareBulkData;
