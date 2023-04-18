import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
  GraphqlScalar,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntityQueryResolver from '../createEntityQueryResolver';

type Args = {
  whereOne: {
    id: string;
  };
};

const createChildEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'childEntity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entityQueryResolver = createEntityQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityQueryResolver) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> =>
    entityQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createChildEntityQueryResolver;
