import pluralize from 'pluralize';

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
import composeQueryResolver from '../../utils/composeQueryResolver';

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
  const { name: entityName } = entityConfig;

  const inventoryChain: InventoryChain = ['Query', 'entitiesByUnique', entityName];
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
    composeQueryResolver(pluralize(entityName), generalConfig, serversideConfig)(
      parent,
      args,
      context,
      info,
      resolverOptions,
    );

  return resolver;
};

export default createEntitiesByUniqueQueryResolver;
