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
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import composeWhereInput from '../../utils/mergeWhereAndFilter/composeWhereInput';
import composeFacet from './composeFacet';

type Args = {
  where?: any;
  restrictedWhere: any[];
  search?: string;
};

const createEntityCountsQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name: entityName } = entityConfig;
  const inventoryChain: InventoryChain = ['Query', 'entityCounts', entityName];
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
  ): Promise<number[]> => {
    const { involvedFilters } = resolverOptions;

    const { where, restrictedWhere, search } = args;

    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return restrictedWhere.map(() => 0);

    // "$facet" stage with no output fields is not allowed by mongodb
    if (restrictedWhere.length === 0) return [];

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    // filter is applied once to the common "where" so it restricts every count
    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

    const restrictedWhere2 = restrictedWhere.map(
      (item) => composeWhereInput(item, entityConfig, { forRestrictedWhere: true }).where,
    );

    const pipeline: Record<string, any>[] = [...lookups];

    if (search) {
      pipeline.unshift({ $match: { $text: { $search: search } } });
    }

    if (Object.keys(where2).length) {
      pipeline.push({ $match: where2 });
    }

    pipeline.push(composeFacet(restrictedWhere2));

    const [facetResult] = await Entity.aggregate(pipeline).exec();

    // if no document matches, "$count" returns no document (not {"count": 0})
    return restrictedWhere2.map((_, i) => facetResult[i][0]?.count ?? 0);
  };

  return resolver;
};

export default createEntityCountsQueryResolver;
