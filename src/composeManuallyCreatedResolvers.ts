import { ActionResolver, GeneralConfig, ServersideConfig } from './tsTypes';

type ResolverComposers = Record<
  string,
  (generalConfig: GeneralConfig, serversideConfig: ServersideConfig) => ActionResolver
>;

const composeManuallyCreatedResolvers = (
  manuallyCreatedResolverComposers: { Query: ResolverComposers; Mutation: ResolverComposers },
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const { Query: queryComposers = {}, Mutation: mutationComposers = {} } =
    manuallyCreatedResolverComposers;

  const Query = Object.keys(queryComposers).reduce((prev, key) => {
    const resolver = queryComposers[key](generalConfig, serversideConfig);

    if (resolver) {
      prev[key] = resolver;
    }

    return prev;
  }, {} as Record<string, ActionResolver>);

  const Mutation = Object.keys(mutationComposers).reduce((prev, key) => {
    const resolver = mutationComposers[key](generalConfig, serversideConfig);

    if (resolver) {
      prev[key] = resolver;
    }

    return prev;
  }, {} as Record<string, ActionResolver>);

  return { Query, Mutation };
};

export default composeManuallyCreatedResolvers;
