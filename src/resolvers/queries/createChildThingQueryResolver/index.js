// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import createThingQueryResolver from '../createThingQueryResolver';

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object };

const createChildThingQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const thingQueryResolver = createThingQueryResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!thingQueryResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => thingQueryResolver(parent, args, context, info, parentFilter);

  return resolver;
};

export default createChildThingQueryResolver;
