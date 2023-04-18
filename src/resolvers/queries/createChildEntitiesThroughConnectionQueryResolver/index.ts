import type {
  Context,
  GeneralConfig,
  Inventory,
  NearInput,
  ServersideConfig,
  EntityConfig,
  InventoryСhain,
  SintheticResolverInfo,
  GraphqlObject,
  GraphqlScalar,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntitiesThroughConnectionQueryResolver from '../createEntitiesThroughConnectionQueryResolver';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  search?: string;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
};

const createChildEntitiesThroughConnectionQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'childEntitiesThroughConnection', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesThroughConnectionQueryResolver = createEntitiesThroughConnectionQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entitiesThroughConnectionQueryResolver) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> =>
    entitiesThroughConnectionQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createChildEntitiesThroughConnectionQueryResolver;
