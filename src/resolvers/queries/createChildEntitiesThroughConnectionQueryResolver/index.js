// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntitiesThroughConnectionQueryResolver from '../createEntitiesThroughConnectionQueryResolver';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  search?: string,
  after?: string,
  before?: string,
  first?: number,
  last?: number,
};

const createChildEntitiesThroughConnectionQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'childEntitiesThroughConnection', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesThroughConnectionQueryResolver = createEntitiesThroughConnectionQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entitiesThroughConnectionQueryResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => entitiesThroughConnectionQueryResolver(parent, args, context, info, parentFilters);

  return resolver;
};

export default createChildEntitiesThroughConnectionQueryResolver;
