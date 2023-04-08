import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  NearInput,
  ServersideConfig,
  EntityConfig,
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

const createChildEntitiesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'childEntities', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = createEntitiesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entitiesQueryResolver) return null;

  const resolver = async (
    parent: any,
    args: Args,
    context: Context,
    info: any,
    involvedFilters: {
      [derivativeConfigName: string]: null | Array<any>;
    },
  ): Promise<any> => entitiesQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createChildEntitiesQueryResolver;
