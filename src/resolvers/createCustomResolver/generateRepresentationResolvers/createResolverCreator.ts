import type {
  Context,
  EntityConfig,
  GeneralConfig,
  ServersideConfig,
  InvolvedFilter,
  GraphqlObject,
  SintheticResolverInfo,
  ActionResolver,
} from '@/tsTypes';

import composeRepresentationConfig from '@/utils/composeRepresentationConfig';

// resolver creators don't depend on configs (they get them as arguments), so they are cached...
// ... by the action name & representation key only
const store = Object.create(null);

type ResoverCreator = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => null | any;

const createResolverCreator = (
  queryOrMutationName: string,
  regularResolverCreator: any,
  representationKey: string,
): ResoverCreator => {
  const key = `${queryOrMutationName}${representationKey}`;

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[key]) {
    return store[key];
  }

  const resolverCreator = (
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
  ): null | any => {
    const inAnyCase = true;
    const regularResolver: ActionResolver = regularResolverCreator(
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    );
    if (!regularResolver) return null;

    // the regular resolver works with the root entity config (e.g. to use its collection), but...
    // ... calculated fields have to be taken from the representation config (it can add its own)
    const { representation = {} } = generalConfig;

    const calculatedFieldsConfig =
      composeRepresentationConfig(representation[representationKey], entityConfig, generalConfig) ||
      undefined;

    const resolver = async (
      _: null | GraphqlObject,
      args: GraphqlObject,
      context: Context,
      info: SintheticResolverInfo,
      // transfer 'filter' into reguqlar resolver to know how to select data if inAnyCase = true
      resolverOptions: {
        involvedFilters: {
          [representationConfigName: string]:
            null | [InvolvedFilter[]] | [InvolvedFilter[], number];
        };
      },
    ) => regularResolver(_, args, context, info, { ...resolverOptions, calculatedFieldsConfig });

    return resolver;
  };
  store[key] = resolverCreator;
  return store[key];
};

export default createResolverCreator;
