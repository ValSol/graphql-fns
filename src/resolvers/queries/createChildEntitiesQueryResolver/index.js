// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
  search?: string,
};

const createChildEntitiesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'childEntities', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = createEntitiesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entitiesQueryResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    involvedFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => entitiesQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createChildEntitiesQueryResolver;
