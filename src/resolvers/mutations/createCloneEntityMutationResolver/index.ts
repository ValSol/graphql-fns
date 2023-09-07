import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../tsTypes';

import composeStandardMutationResolver from '../composeStandardMutationResolver';
import resolverAttributes from './resolverAttributes';

type Result = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => any | null;

const createCloneEntityMutationResolver: Result =
  composeStandardMutationResolver(resolverAttributes);

export default createCloneEntityMutationResolver;
