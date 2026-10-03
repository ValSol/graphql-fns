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
import composeWhereInput from '../../utils/mergeWhereAndFilter/composeWhereInput';
import composeFacet from './composeFacet';

type Args = {
  where?: any;
  restrictedWhereAndTarget: { target: string; where?: any }[];
  search?: string;
};

// returns the distinct values of several targets in one aggregate: the common "where" ...
// ... (with its lookups) and "search" are applied once, then every item is a "$facet" branch; ...
// ... every list is the same as "XDistinctValues" returns for "where" AND the item's "where" ...
// ... (falsy values are dropped, BSON order); the "$facet" output document is limited ...
// ... to 16 MB, so a target with many long values (e.g. titles of a large collection) may exceed it
const createEntityManyDistinctValuesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name: entityName } = entityConfig;
  const inventoryChain: InventoryChain = ['Query', 'entityManyDistinctValues', entityName];
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
  ): Promise<GraphqlScalar[][]> => {
    const { involvedFilters } = resolverOptions;

    const { where, restrictedWhereAndTarget, search } = args;

    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return restrictedWhereAndTarget.map(() => []);

    // "$facet" stage with no output fields is not allowed by mongodb
    if (restrictedWhereAndTarget.length === 0) return [];

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    // filter is applied once to the common "where" so it restricts every list
    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

    const items = restrictedWhereAndTarget.map(({ target, where: restrictedWhere }) => ({
      target,
      where: restrictedWhere
        ? composeWhereInput(restrictedWhere, entityConfig, { forRestrictedWhere: true }).where
        : undefined,
    }));

    const pipeline = composeAggregateHead({ where: where2, lookups, search });

    pipeline.push(composeFacet(items));

    const [facetResult] = await Entity.aggregate(pipeline).exec();

    return items.map((_, i) =>
      facetResult[i].map(({ _id }: { _id: GraphqlScalar }) => _id).filter(Boolean),
    );
  };

  return resolver;
};

export default createEntityManyDistinctValuesQueryResolver;
