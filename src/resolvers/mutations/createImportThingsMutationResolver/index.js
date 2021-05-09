// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import importThingsResolverAttributes from './importThingsResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createImportThingsMutationResolver: Result = composeStandardMutationResolver(
  importThingsResolverAttributes,
);

export default createImportThingsMutationResolver;
