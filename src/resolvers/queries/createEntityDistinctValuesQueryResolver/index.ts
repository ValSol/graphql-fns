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
  where?: any;
  options: {
    target: string;
  };
};

const createEntityDistinctValuesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;
  const inventoryChain: InventoryСhain = ['Query', 'entityDistinctValues', name];
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

    const {
      where,
      options: { target },
    } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length) {
      const pipeline = [...lookups];

      if (Object.keys(conditions).length) {
        pipeline.push({ $match: conditions });
      }

      pipeline.push({ $project: { _id: 1 } });

      const ids = await Entity.aggregate(pipeline).exec();

      const result = await Entity.distinct(target, { _id: { $in: ids } });

      return result.filter(Boolean);
    }

    const result = await Entity.distinct(target, conditions);

    return result.filter(Boolean);
  };

  return resolver;
};

export default createEntityDistinctValuesQueryResolver;
