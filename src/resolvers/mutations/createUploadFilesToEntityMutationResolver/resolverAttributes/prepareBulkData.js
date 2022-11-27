// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processUploadedFiles from '../../processUploadedFiles';
import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig, serversideConfig } = resolverCreatorArg;
  const { args, context } = resolverArg;
  const { data, files, options, positions } = args;
  const { mongooseConn } = context;

  const filesUploaded = await Promise.all(files);

  const { forPush, forUpdate } = await processUploadedFiles({
    context,
    data,
    filesUploaded,
    mongooseConn,
    options,
    serversideConfig,
    entityConfig,
  });

  const {
    mains: [previous],
  } = prevPreparedData;

  const preparedDataForUpdate = processCreateInputData(
    { ...forUpdate, id: previous._id }, // eslint-disable-line no-underscore-dangle
    { ...prevPreparedData, mains: [] },
    entityConfig,
    'update', // for update
  );

  const preparedData = processCreateInputData(
    { ...forPush, id: previous._id }, // eslint-disable-line no-underscore-dangle
    { ...preparedDataForUpdate, mains: [] },
    entityConfig,
    'push',
    positions,
  );

  return preparedData;
};

export default prepareBulkData;
