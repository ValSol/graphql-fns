import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  GraphqlScalar,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
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
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return 0;

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
