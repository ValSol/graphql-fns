// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';
import processDeleteData from '../../processDeleteData';
import processDeleteDataPrepareArgs from '../processDeleteDataPrepareArgs';

const prepareBulkData: PrepareBulkData = async (resolverCreatorArg, resolverArg, previous) => {
  const { thingConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  const { duplexFields } = thingConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        },
        { _id: 1 },
      )
    : {};

  const [previousThing] = previous;

  const coreForDeletions = Object.keys(duplexFieldsProjection).length
    ? processDeleteData(
        processDeleteDataPrepareArgs(data, previousThing, thingConfig),
        null,
        thingConfig,
      )
    : null;

  const preparedData = processCreateInputData(
    { ...data, id: previousThing._id }, // eslint-disable-line no-underscore-dangle
    [],
    coreForDeletions,
    null,
    thingConfig,
    'update', // for update
  );

  return preparedData;
};

export default prepareBulkData;
