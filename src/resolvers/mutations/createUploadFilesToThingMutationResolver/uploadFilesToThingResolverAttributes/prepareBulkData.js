// @flow
import type { PrepareBulkData } from '../../../flowTypes';

import processUploadedFiles from '../../processUploadedFiles';
import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (resolverCreatorArg, resolverArg, [previous]) => {
  const { thingConfig, serversideConfig } = resolverCreatorArg;
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
    thingConfig,
  });

  const { core: coreForUpdate } = processCreateInputData(
    { ...forUpdate, id: previous._id }, // eslint-disable-line no-underscore-dangle
    [],
    null,
    null,
    thingConfig,
    'update', // for update
  );

  const preparedData = processCreateInputData(
    { ...forPush, id: previous._id }, // eslint-disable-line no-underscore-dangle
    [],
    coreForUpdate,
    null,
    thingConfig,
    'push',
    positions,
  );

  return preparedData;
};

export default prepareBulkData;
