import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  where: {
    id: string;
  };
};

const createEntityFileCountQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'entityFileCount', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: any,
    args: Args,
    context: Context,
    info: any,
    involvedFilters: {
      [derivativeConfigName: string]: null | Array<any>;
    },
  ): Promise<any> => {
    const filter = getFilterFromInvolvedFilters(involvedFilters);

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
