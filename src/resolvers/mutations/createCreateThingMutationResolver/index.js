// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import createThingResolverAttributes from './createThingResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createCreateThingMutationResolver: Result = composeStandardMutationResolver(
  createThingResolverAttributes,
);

export default createCreateThingMutationResolver;
