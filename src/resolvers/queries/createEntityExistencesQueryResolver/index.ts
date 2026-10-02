import type {
  Context,
  GeneralConfig,
  InventoryChain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mapWithConcurrency from '../../../utils/mapWithConcurrency';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  whereAndSearch: Array<{
    where?: any;
    search?: string;
  }>;
};

const createEntityExistencesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name: entityName } = entityConfig;
  const inventoryChain: InventoryChain = ['Query', 'entityExistences', entityName];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const { entityExistencesConcurrency = 10 } = serversideConfig;

  if (!Number.isInteger(entityExistencesConcurrency) || entityExistencesConcurrency < 1) {
    throw new TypeError(
      `"entityExistencesConcurrency" has to be a positive integer, got: ${entityExistencesConcurrency}!`,
    );
  }

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    resolverOptions: {
      involvedFilters: {
        [representationConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
      };
    },
  ): Promise<boolean[]> => {
    const { involvedFilters } = resolverOptions;

    const { whereAndSearch } = args;

    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return whereAndSearch.map(() => false);

    if (whereAndSearch.length === 0) return [];

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    // every pair is checked by a separate query that stops on the first found entity ...
    // ... (unlike "$count" of "XCount" that goes through all found entities); ...
    // ... the queries are limited to not take the whole connection pool shared with other requests
    return mapWithConcurrency(
      whereAndSearch,
      entityExistencesConcurrency,
      async ({ where, search }) => {
        const { lookups, where: where2 } = mergeWhereAndFilter(filter, where || {}, entityConfig);

        if (lookups.length || search) {
          const pipeline: Record<string, any>[] = [...lookups];

          if (search) {
            pipeline.unshift({ $match: { $text: { $search: search } } });
          }

          if (Object.keys(where2).length) {
            pipeline.push({ $match: where2 });
          }

          pipeline.push({ $limit: 1 }, { $project: { _id: 1 } });

          const result = await Entity.aggregate(pipeline).exec();

          return result.length > 0;
        }

        const result = await Entity.find(where2, { _id: 1 }).limit(1).lean().exec();

        return result.length > 0;
      },
    );
  };

  return resolver;
};

export default createEntityExistencesQueryResolver;
