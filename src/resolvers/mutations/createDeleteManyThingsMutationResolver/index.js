// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import deleteManyThingsResolverAttributes from './deleteManyThingsResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createDeleteManyThingsMutationResolver: Result = composeStandardMutationResolver(
  deleteManyThingsResolverAttributes,
);

export default createDeleteManyThingsMutationResolver;
