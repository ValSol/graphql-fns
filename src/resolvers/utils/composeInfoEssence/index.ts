import type { InfoEssence, ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import getProjectionFromInfo from '../getProjectionFromInfo';

const InfoEssence = (
  entityConfig: TangibleEntityConfig,
  resolverArg: ResolverArg,
  path: string[] = [],
): InfoEssence => ({
  projection: getProjectionFromInfo(entityConfig, resolverArg, path),
  path: path as [],
  fieldArgs: {} as Record<string, any>,
});

export default InfoEssence;
