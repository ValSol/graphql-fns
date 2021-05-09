// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (resolverCreatorArg, resolverArg, previous) => {
  const { thingConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data, positions } = args;

  const [previousThing] = previous;

  const preparedData = processCreateInputData(
    { ...data, id: previousThing._id }, // eslint-disable-line no-underscore-dangle
    [],
    null,
    null,
    thingConfig,
    'push',
    positions,
  );

  return preparedData;
};

export default prepareBulkData;
