// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import executeAuthorisation from '../executeAuthorisation';
import createThingQueryResolver from '../queries/createThingQueryResolver';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;

  const thingQueryResolver = createThingQueryResolver(thingConfig, generalConfig, serversideConfig);
  if (!thingQueryResolver) return null;

  const inventoryChain = ['Query', 'thing', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { fieldName } = info;

    const id = parent[fieldName];

    if (!id) return null;

    const thing = await thingQueryResolver(null, { whereOne: { id } }, context, info);

    if (!thing) return null; // if there's broken link

    return thing;
  };

  return resolver;
};

export default createThingScalarResolver;
