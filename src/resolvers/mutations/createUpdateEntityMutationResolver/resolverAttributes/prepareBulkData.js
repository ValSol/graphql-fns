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
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args;

  const { duplexFields } = entityConfig;
  const duplexFieldsProjection = duplexFields
    ? duplexFields.reduce(
        (prev, { name: name2 }) => {
          prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        },
        { _id: 1 },
      )
    : {};

  const { core, mains: previousEntities } = prevPreparedData;

  let coreForDeletions = core;

  previousEntities.forEach((previousEntity) => {
    coreForDeletions = Object.keys(duplexFieldsProjection).length
      ? processDeleteData(
          processDeleteDataPrepareArgs(data, previousEntity, entityConfig),
          coreForDeletions,
          entityConfig,
        )
      : coreForDeletions;
  });

  let preparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

  previousEntities.forEach((previousEntity) => {
    preparedData = processCreateInputData(
      { ...data, id: previousEntity._id }, // eslint-disable-line no-underscore-dangle
      preparedData,
      entityConfig,
      'update',
    );
  });

  return preparedData;
};

export default prepareBulkData;
