// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createEntitiesQueryResolver from '../createEntitiesQueryResolver';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
  search?: string,
};
type Context = { mongooseConn: Object };

const createEntitiesByUniqueQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entitiesByUnique', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entitiesQueryResolver = createEntitiesQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) return null;

    return entitiesQueryResolver(parent, args, context, info, parentFilter);
  };

  return resolver;
};

export default createEntitiesByUniqueQueryResolver;