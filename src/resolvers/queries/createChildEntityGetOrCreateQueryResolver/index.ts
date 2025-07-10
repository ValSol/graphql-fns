import type {
  Context,
  GeneralConfig,
  InventoryChain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
  GraphqlScalar,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntityQueryResolver from '../createEntityQueryResolver';
import createCreateEntityMutationResolver from '../../mutations/createCreateEntityMutationResolver';

type Args = {
  whereOne: {
    id: string;
  };
  data: GraphqlObject;
};

const createChildEntityGetOrCreateQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'childEntityGetOrCreate', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entityQueryResolver = createEntityQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityQueryResolver) return null;

  const createEntityMutationResolver = createCreateEntityMutationResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!createEntityMutationResolver) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    if (args.whereOne) {
      return entityQueryResolver(parent, args, context, info, involvedFilters);
    }

    return createEntityMutationResolver(parent, args, context, info, involvedFilters);
  };

  return resolver;
};

export default createChildEntityGetOrCreateQueryResolver;
