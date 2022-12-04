// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { where: { id: string } };

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
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { where } = args;

    const { mongooseConn } = context;

    const fileSchema = createFileSchema(entityConfig);

    const nakedName = name.slice('Tangible'.length);

    const FileModel = mongooseConn.model(`${nakedName}_File`, fileSchema);

    const { where: conditions } = mergeWhereAndFilter(filter, where, entityConfig);

    const projection = {};

    const filesData = await FileModel.find(conditions, projection, { lean: true });

    return filesData.map((fileData) => ({
      ...composeFileFieldsData[nakedName](fileData),
      ...fileData,
      id: fileData._id, // eslint-disable-line no-underscore-dangle
    }));
  };

  return resolver;
};

export default createEntityFilesQueryResolver;
