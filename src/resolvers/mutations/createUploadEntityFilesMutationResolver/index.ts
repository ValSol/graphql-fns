import type {GeneralConfig, ServersideConfig, EntityConfig} from '../../../tsTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import uploadEntityFilesResolverAttributes from './uploadEntityFilesResolverAttributes';

type Result = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => any | null;

const createUploadEntityFilesMutationResolver: Result = composeStandardMutationResolver(
  uploadEntityFilesResolverAttributes,
);

export default createUploadEntityFilesMutationResolver;
