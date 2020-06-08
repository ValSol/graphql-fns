// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import createThingsQueryResolver from '../queries/createThingsQueryResolver';
import executeAuthorisation from '../executeAuthorisation';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingArrayResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;

  const thingQueryResolver = createThingsQueryResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
  );
  if (!thingQueryResolver) return null;

  const inventoryChain = ['Query', 'things', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { fieldName } = info;

    const ids = parent[fieldName];

    if (!ids || !ids.length) return [];

    const things = await thingQueryResolver(null, { where: { id_in: ids } }, context, info);

    return things;
  };

  return resolver;
};

export default createThingArrayResolver;
