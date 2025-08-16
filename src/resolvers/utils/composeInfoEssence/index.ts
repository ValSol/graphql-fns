import type { ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import getProjectionFromInfo from '../getProjectionFromInfo';

type Path = string[];

const InfoEssence = (
  entityConfig: TangibleEntityConfig,
  resolverArg: ResolverArg,
  path: Path = [],
) => ({ projection: getProjectionFromInfo(entityConfig, resolverArg, path), path });

export default InfoEssence;
