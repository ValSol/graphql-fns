// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createThingsQueryResolver from '../createThingsQueryResolver';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
  search?: string,
};
type Context = { mongooseConn: Object };

const createThingsByUniqueQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'thingsByUnique', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const thingsQueryResolver = createThingsQueryResolver(
    thingConfig,
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

    return thingsQueryResolver(parent, args, context, info, parentFilter);
  };

  return resolver;
};

export default createThingsByUniqueQueryResolver;
