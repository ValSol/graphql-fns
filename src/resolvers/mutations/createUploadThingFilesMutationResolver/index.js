// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import uploadThingFilesResolverAttributes from './uploadThingFilesResolverAttributes';

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createUploadThingFilesMutationResolver: Result = composeStandardMutationResolver(
  uploadThingFilesResolverAttributes,
);

export default createUploadThingFilesMutationResolver;
