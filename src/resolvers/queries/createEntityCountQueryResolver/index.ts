import type {
  Context,
  GeneralConfig,
  InventoryChain,
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
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';

type Args = {
  where?: any;
  search?: string;
};

const createEntityCountQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;
  const inventoryChain: InventoryChain = ['Query', 'entityCount', name];
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

    if (!filter) return 0;

    const { where, search } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups?.length || search) {
      const pipeline = [...lookups];

      if (search) {
        pipeline.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(where2)?.length) {
        pipeline.push({ $match: where2 });
      }

      pipeline.push({ $count: 'count' });

      const result = await Entity.aggregate(pipeline).exec();

      // somehow if empty result of query ...
      // ... object {"count": 0} in result is not created
      const [{ count }] = result.length > 0 ? result : [{ count: 0 }];

      return count;
    }

    const result = await Entity.countDocuments(where2);

    return result;
  };

  return resolver;
};

export default createEntityCountQueryResolver;
