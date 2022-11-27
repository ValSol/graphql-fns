// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createFileSchema from '../../../mongooseModels/createFileSchema';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createEntityFileCountQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entityFileCount', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

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

    const nakedName = name.slice('Root'.length);

    const FileModel = mongooseConn.model(`${nakedName}_File`, fileSchema);

    const { where: conditions } = mergeWhereAndFilter(filter, where, entityConfig);

    const result = await FileModel.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createEntityFileCountQueryResolver;
