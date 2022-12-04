// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { whereOne: { id: string } };

const createEntityFilesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entityFile', name];
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

    const { whereOne } = args;

    const { mongooseConn } = context;

    const fileSchema = createFileSchema(entityConfig);

    const nakedName = name.slice('Root'.length);

    const FileModel = mongooseConn.model(`${nakedName}_File`, fileSchema);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }
    const { where: conditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

    const projection = {};

    const fileData = await FileModel.findOne(conditions, projection, { lean: true });

    if (!fileData) return null;

    const fileFields = composeFileFieldsData[nakedName](fileData);

    return { ...fileFields, ...fileData, id: fileData._id }; // eslint-disable-line no-underscore-dangle
  };

  return resolver;
};

export default createEntityFilesQueryResolver;