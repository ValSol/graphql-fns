// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import pushIntoThingResolverAttributes from './pushIntoThingResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createPushIntoThingMutationResolver: Result = composeStandardMutationResolver(
  pushIntoThingResolverAttributes,
);

export default createPushIntoThingMutationResolver;
