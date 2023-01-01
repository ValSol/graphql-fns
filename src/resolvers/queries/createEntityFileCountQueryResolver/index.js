// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = { where: { id: string } };

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
    parentFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => {
    const { foo: filter } = inAnyCase
      ? parentFilters
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { where } = args;

    const { mongooseConn } = context;

    const FileModel = await createMongooseModel(mongooseConn, entityConfig);

    const { where: conditions } = mergeWhereAndFilter(filter, where, entityConfig);

    const result = await FileModel.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createEntityFileCountQueryResolver;
