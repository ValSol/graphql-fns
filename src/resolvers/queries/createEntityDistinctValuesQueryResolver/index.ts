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
import composeAggregateHead from '../../utils/mergeWhereAndFilter/composeAggregateHead';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import composeDistinctValuesStages from '../../utils/composeDistinctValuesStages';

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
  const { name: entityName } = entityConfig;
  const inventoryChain: InventoryChain = ['Query', 'entityDistinctValues', entityName];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

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
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { involvedFilters } = resolverOptions;

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
      // one aggregate: the distinct values are got after the lookups without fetching the ids
      const pipeline = composeAggregateHead({ where: where2, lookups, search });

      pipeline.push(...composeDistinctValuesStages(target));

      const result = await Entity.aggregate(pipeline).exec();

      return result.map(({ _id }) => _id).filter(Boolean);
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
