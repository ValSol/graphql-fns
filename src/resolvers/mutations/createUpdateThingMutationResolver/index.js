// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import updateThingResolverAttributes from './updateThingResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createUpdateThingMutationResolver: Result = composeStandardMutationResolver(
  updateThingResolverAttributes,
);

export default createUpdateThingMutationResolver;
