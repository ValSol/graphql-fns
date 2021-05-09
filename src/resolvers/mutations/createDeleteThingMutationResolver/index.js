// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import deleteThingResolverAttributes from './deleteThingResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const creatDeleteThingMutationResolver: Result = composeStandardMutationResolver(
  deleteThingResolverAttributes,
);

export default creatDeleteThingMutationResolver;
