import type {
  GraphqlObject,
  TangibleEntityConfig,
  TangibleFileEntityConfig,
} from '../../../../tsTypes';
import type { PrepareBulkData, PreparedData } from '../../../tsTypes';

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

  const { data } = args as { data: GraphqlObject[] };

  const { duplexFields } = entityConfig as TangibleEntityConfig;
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

  data.forEach((dataItem, i) => {
    coreForDeletions = Object.keys(duplexFieldsProjection).length
      ? processDeleteData(
          processDeleteDataPrepareArgs(
            dataItem,
            previousEntities[i],
            entityConfig as TangibleEntityConfig,
          ),
          coreForDeletions,
          entityConfig as TangibleEntityConfig,
        )
      : coreForDeletions;
  });

  let preparedData: PreparedData = { ...prevPreparedData, core: coreForDeletions, mains: [] };

  data.forEach((dataItem, i) => {
    preparedData = processCreateInputData(
      { ...dataItem, id: previousEntities[i]._id }, // eslint-disable-line no-underscore-dangle
      preparedData,
      entityConfig as TangibleEntityConfig,
      'update',
    );
  });

  return preparedData;
};

export default prepareBulkData;
