import type {
  Context,
  GeneralConfig,
  NearInput,
  ServersideConfig,
  EntityConfig,
  InventoryChain,
  SintheticResolverInfo,
  GraphqlObject,
  GraphqlScalar,
  InvolvedFilter,
} from '@/tsTypes';
import checkInventory from '@/utils/inventory/checkInventory';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';

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

  const inventoryChain: InventoryChain = ['Query', 'childEntitiesThroughConnection', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    resolverOptions: {
      involvedFilters: {
        [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
      };
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> =>
    composeQueryResolver(`${name}_ThroughConnection`, generalConfig, serversideConfig)(
      parent,
      args,
      context,
      info,
      resolverOptions,
    );

  return resolver;
};

export default createChildEntitiesThroughConnectionQueryResolver;
