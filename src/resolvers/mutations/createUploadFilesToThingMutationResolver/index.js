// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import uploadFilesToThingResolverAttributes from './uploadFilesToThingResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createUploadFilesToThingMutationResolver: Result = composeStandardMutationResolver(
  uploadFilesToThingResolverAttributes,
);

export default createUploadFilesToThingMutationResolver;
