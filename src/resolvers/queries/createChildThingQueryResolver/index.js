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
  const { name } = thingConfig;

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
  ): Object => {
    if (!parent) {
      throw new TypeError(`Got undefined parent in resolver: "childThing" for thing: "${name}"!`);
    }
    const { fieldName } = info;

    const id = parent[fieldName]; // eslint-disable-line camelcase

    const whereOne = { id };

    return thingQueryResolver(null, { ...args, whereOne }, context, info, parentFilter);
  };

  return resolver;
};

export default createChildThingQueryResolver;
