// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import resolverAttributes from './resolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createDeleteFilteredThingsWithChildrenReturnScalarMutationResolver: Result = composeStandardMutationResolver(
  resolverAttributes,
);

export default createDeleteFilteredThingsWithChildrenReturnScalarMutationResolver;
