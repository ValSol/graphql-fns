// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { where: { id: string }, pagination?: { skip: number, first: number } };

const createEntityFilesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entityFiles', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const { composeFileFieldsData } = serversideConfig;
  if (!composeFileFieldsData) {
    throw new TypeError(
      '"composeFileFieldsData" callbacks have to be defined in serversideConfig!',
    );
  }

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => {
    const { foo: filter } = parentFilters;

    if (!filter) return null;

    const { where, pagination } = args;

    const { mongooseConn } = context;

    const FileModel = await createMongooseModel(mongooseConn, entityConfig);

    const nakedName = name.slice('Tangible'.length);

    const { where: conditions } = mergeWhereAndFilter(filter, where, entityConfig);

    const projection = {};

    // const filesData = await FileModel.find(conditions, projection, { lean: true });

    let query = FileModel.find(conditions, projection, { lean: true });

    if (pagination) {
      const { skip, first: limit } = pagination;
      query = query.skip(skip).limit(limit);
    }

    const filesData = await query.exec();

    return filesData.map((fileData) => ({
      ...composeFileFieldsData[nakedName](fileData),
      ...fileData,
      id: fileData._id, // eslint-disable-line no-underscore-dangle
    }));
  };

  return resolver;
};

export default createEntityFilesQueryResolver;
