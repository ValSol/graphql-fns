// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntityQueryResolver from '../createEntityQueryResolver';

type Args = { whereOne: { id: string } };

const createChildEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'childEntity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const entityQueryResolver = createEntityQueryResolver(
    entityConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!entityQueryResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    involvedFilters: { [derivativeConfigName: string]: null | Array<Object> },
  ): Object => entityQueryResolver(parent, args, context, info, involvedFilters);

  return resolver;
};

export default createChildEntityQueryResolver;
