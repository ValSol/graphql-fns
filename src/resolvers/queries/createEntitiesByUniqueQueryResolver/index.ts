import type {
  Context,
  GeneralConfig,
  InventoryChain,
  NearInput,
  ServersideConfig,
  EntityConfig,
  SintheticResolverInfo,
  GraphqlObject,
  GraphqlScalar,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';

type Args = {
  where?: any;
  near?: NearInput;
  sort?: {
    sortBy: Array<string>;
  };
  pagination?: {
    skip: number;
    first: number;
  };
  search?: string;
};

const createEntitiesByUniqueQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entitiesByUnique', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = createEntitiesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> =>
    entitiesQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createEntitiesByUniqueQueryResolver;
