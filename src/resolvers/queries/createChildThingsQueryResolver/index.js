// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../../flowTypes';

import createThingsQueryResolver from '../createThingsQueryResolver';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
  search?: string,
};
type Context = { mongooseConn: Object };

const createChildThingsQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const thingsQueryResolver = createThingsQueryResolver(
    thingConfig,
    generalConfig,
    serversideConfig,
    true, // inAnyCase,
  );
  if (!thingsQueryResolver) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => thingsQueryResolver(parent, args, context, info, parentFilter);

  return resolver;
};

export default createChildThingsQueryResolver;
