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
  const { name: entityName } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'childEntity', entityName];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> =>
    composeQueryResolver(entityName, generalConfig, serversideConfig)(
      parent,
      args,
      context,
      info,
      involvedFilters,
    );

  return resolver;
};

export default createChildEntityQueryResolver;
