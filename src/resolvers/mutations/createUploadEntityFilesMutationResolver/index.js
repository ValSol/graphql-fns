// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import uploadEntityFilesResolverAttributes from './uploadEntityFilesResolverAttributes';

type Result = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createUploadEntityFilesMutationResolver: Result = composeStandardMutationResolver(
  uploadEntityFilesResolverAttributes,
);

export default createUploadEntityFilesMutationResolver;
