// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';

import createEntityQueryResolver from '../createEntityQueryResolver';

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object };

const createchildEntityQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
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
    parentFilter: Array<Object>,
  ): Object => entityQueryResolver(parent, args, context, info, parentFilter);

  return resolver;
};

export default createchildEntityQueryResolver;
