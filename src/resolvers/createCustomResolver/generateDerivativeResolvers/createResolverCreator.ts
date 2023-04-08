import type {EntityConfig, GeneralConfig, ServersideConfig} from '../../../tsTypes';

const store = Object.create(null);

type ResoverCreator = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => null | any;

const createResolverCreator = (queryOrMutationName: string, regularResolverCreator: any): ResoverCreator => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[queryOrMutationName]) {
    return store[queryOrMutationName];
  }

  const resolverCreator = (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): null | any => {
    const inAnyCase = true;
    const regularResolver = regularResolverCreator(
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    );
    if (!resolverCreator) return null;

    const resolver = async (
      _: any,
      args: any,
      context: any,
      info: any,
      // transfer 'filter' into reguqlar resolver to know how to select data if inAnyCase = true
      filter: Array<any>,
    ) => regularResolver(_, args, context, info, filter);

    return resolver;
  };
  store[queryOrMutationName] = resolverCreator;
  return store[queryOrMutationName];
};

export default createResolverCreator;
