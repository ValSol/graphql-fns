import type {
  Context,
  GeneralConfig,
  InventoryChain,
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
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';

type Args = {
  where?: any;
  search?: string;
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
  const inventoryChain: InventoryChain = ['Query', 'entityDistinctValues', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = createEntitiesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entitiesQueryResolver) return null;

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
      search,
      options: { target },
    } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length > 0) {
      const pipeline = [...lookups];

      if (search) {
        pipeline.unshift({ $sort: { score: { $meta: 'textScore' } } });
        pipeline.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(where2).length > 0) {
        pipeline.push({ $match: where2 });
      }

      if (!search) {
        // not use "$project" if used "search" to prevent error: field names may not start with '$'
        pipeline.push({ $project: { _id: 1 } });
      }

      const ids = await Entity.aggregate(pipeline).exec();

      const result = await Entity.distinct(target, { _id: { $in: ids } });

      return result.filter(Boolean);
    }

    let query = Entity.distinct(target);

    if (Object.keys(where2).length > 0) query = query.where(where2);

    if (search) query = query.where({ $text: { $search: search } });

    const result = await query.exec();

    return result.filter(Boolean);

    // const result = await Entity.distinct(target, where2);

    // return result.filter(Boolean);
  };

  return resolver;
};

export default createEntityDistinctValuesQueryResolver;
