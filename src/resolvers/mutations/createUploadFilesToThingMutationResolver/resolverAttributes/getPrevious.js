// @flow

import type { GetPrevious } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import createThing from '../../../../mongooseModels/createThing';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';
import composeMockFilesData from '../composeMockFilesData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { thingConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, info, parentFilter } = resolverArg;
  const { inventory, enums } = generalConfig;
  const { saveFiles, composeFileFieldsData } = serversideConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const filter = inAnyCase
    ? parentFilter
    : // $FlowFixMe
      await executeAuthorisation(inventoryChain, context, serversideConfig);

  if (!filter) return null;

  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  if (!saveFiles) {
    throw new TypeError('"saveFiles" callbacks have to be defined in serversideConfig!');
  }

  const { whereOne, data, files, options } = args;
  const { mongooseConn } = context;

  const filesUploaded = await Promise.all(files);

  const processingKind = 'update';
  const mockFilesData = composeMockFilesData(
    options,
    data,
    filesUploaded,
    thingConfig,
    composeFileFieldsData,
  );
  // check filter upfront data that uploading so if there is limit
  const allowCreate = await checkData(
    { data: mockFilesData, whereOne },
    filter,
    thingConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  if (!allowCreate) return null;

  const defaultProjection = getProjectionFromInfo(info);

  const projection = checkInventory(['Subscription', 'updatedThing', name], inventory)
    ? {} // if subsciption ON - return empty projection - to get all fields of thing
    : defaultProjection;

  const { where } = mergeWhereAndFilter([], whereOne, thingConfig);

  const Thing = await createThing(mongooseConn, thingConfig, enums);

  const previousThing = await Thing.findOne(where, projection, { lean: true });

  return previousThing && [previousThing];
};

export default get;
