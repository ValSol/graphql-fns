// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import resolverAttributes from './resolverAttributes';

type Result = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const createUploadFilesToEntityMutationResolver: Result =
  composeStandardMutationResolver(resolverAttributes);

export default createUploadFilesToEntityMutationResolver;
