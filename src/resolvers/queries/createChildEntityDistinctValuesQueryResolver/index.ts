import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  InventoryСhain,
  SintheticResolverInfo,
  GraphqlObject,
  GraphqlScalar,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntityDistinctValuesQueryResolver from '../createEntityDistinctValuesQueryResolver';

type Args = {
  where?: any;
  search?: string;
};

const createChildEntityDistinctValuesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'childEntitiesThroughConnection', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entityDistinctValuesQueryResolver = createEntityDistinctValuesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityDistinctValuesQueryResolver) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> =>
    entityDistinctValuesQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createChildEntityDistinctValuesQueryResolver;
