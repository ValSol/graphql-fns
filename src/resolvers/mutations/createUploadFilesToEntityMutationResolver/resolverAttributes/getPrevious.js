// @flow

import type { GetPrevious } from '../../../flowTypes';

import checkInventory from '../../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../../utils/executeAuthorisation';
import getProjectionFromInfo from '../../../utils/getProjectionFromInfo';
import createMongooseModel from '../../../../mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '../../../utils/mergeWhereAndFilter';
import checkData from '../../checkData';
import composeMockFilesData from '../composeMockFilesData';

const get: GetPrevious = async (actionGeneralName, resolverCreatorArg, resolverArg) => {
  const { entityConfig, generalConfig, serversideConfig, inAnyCase } = resolverCreatorArg;
  const { args, context, info, parentFilters } = resolverArg;
  const { inventory, enums } = generalConfig;
  const { saveFiles, composeFileFieldsData } = serversideConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Mutation', actionGeneralName, name];

  const { foo: filter } = inAnyCase
    ? parentFilters
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
    entityConfig,
    composeFileFieldsData,
  );
  // check filter upfront data that uploading so if there is limit
  const allowCreate = await checkData(
    { data: mockFilesData, whereOne },
    filter,
    entityConfig,
    processingKind,
    generalConfig,
    serversideConfig,
    context,
  );

  if (!allowCreate) return null;

  const defaultProjection = getProjectionFromInfo(info);

  const projection = checkInventory(['Subscription', 'updatedEntity', name], inventory)
    ? {} // if subsciption ON - return empty projection - to get all fields of entity
    : defaultProjection;

  const { where } = mergeWhereAndFilter([], whereOne, entityConfig);

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const previousEntity = await Entity.findOne(where, projection, { lean: true });

  return previousEntity && [previousEntity];
};

export default get;
