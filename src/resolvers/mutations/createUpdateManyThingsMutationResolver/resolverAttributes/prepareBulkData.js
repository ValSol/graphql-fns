// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processCreateInputData from '../../processCreateInputData';
import processDeleteData from '../../processDeleteData';
import processDeleteDataPrepareArgs from '../../processDeleteDataPrepareArgs';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
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

  const { core, mains: previousThings } = prevPreparedData;

  let coreForDeletions = core;

  data.forEach((dataItem, i) => {
    coreForDeletions = Object.keys(duplexFieldsProjection).length
      ? processDeleteData(
          processDeleteDataPrepareArgs(dataItem, previousThings[i], thingConfig),
          coreForDeletions,
          thingConfig,
        )
      : coreForDeletions;
  });

  let preparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

  data.forEach((dataItem, i) => {
    preparedData = processCreateInputData(
      { ...dataItem, id: previousThings[i]._id }, // eslint-disable-line no-underscore-dangle
      preparedData,
      thingConfig,
      'update',
    );
  });

  return preparedData;
};

export default prepareBulkData;
