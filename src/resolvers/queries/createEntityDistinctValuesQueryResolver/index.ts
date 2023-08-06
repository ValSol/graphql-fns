import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  GraphqlScalar,
  SintheticResolverInfo,
  InvolvedFilter,
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
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return [];

    const {
      where,
      options: { target },
    } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length > 0) {
      const pipeline = [...lookups];

      if (Object.keys(conditions).length > 0) {
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
