// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import createManyThingsResolverAttributes from './createManyThingsResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createCreateManyThingsMutationResolver: Result = composeStandardMutationResolver(
  createManyThingsResolverAttributes,
);

export default createCreateManyThingsMutationResolver;
