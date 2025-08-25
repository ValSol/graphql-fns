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
import composeQueryResolver from '../../utils/composeQueryResolver';
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
  const { name: entityName } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'childEntityGetOrCreate', entityName];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

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
    resolverOptions: {
      involvedFilters: {
        [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
      };
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    if (args.whereOne) {
      return composeQueryResolver(entityName, generalConfig, serversideConfig)(
        parent,
        args,
        context,
        info,
        resolverOptions,
      );
    }

    return createEntityMutationResolver(parent, args, context, info, resolverOptions);
  };

  return resolver;
};

export default createChildEntityGetOrCreateQueryResolver;
