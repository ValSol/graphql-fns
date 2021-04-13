// @flow
import type { ThingConfig, GeneralConfig, ServersideConfig } from '../../../flowTypes';

const store = {};

type ResoverCreator = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => null | Function;

const createResolverCreator = (
  queryOrMutationName: string,
  regularResolverCreator: Function,
): ResoverCreator => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[queryOrMutationName]) {
    return store[queryOrMutationName];
  }

  const resolverCreator = (
    thingConfig: ThingConfig,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): null | Function => {
    const inAnyCase = true;
    const regularResolver = regularResolverCreator(
      thingConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    );
    if (!resolverCreator) return null;

    const resolver = async (
      _: Object,
      args: Object,
      context: Object,
      info: Object,
      // transfer 'filter' into reguqlar resolver to know how to select data if inAnyCase = true
      filter: Array<Object>,
    ) => regularResolver(_, args, context, info, filter);

    return resolver;
  };
  store[queryOrMutationName] = resolverCreator;
  return store[queryOrMutationName];
};

export default createResolverCreator;
