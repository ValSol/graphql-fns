import type { ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import getSimpleProjectionFromInfo from '../getSimpleProjectionFromInfo';
import composeAllFieldsProjection from '../composeAllFieldsProjection';

type Path = string[];

const getProjectionFromInfo = (
  entityConfig: TangibleEntityConfig,
  resolverArg: ResolverArg,
  path: Path = [],
): Record<string, 1> => {
  const { info } = resolverArg;

  if (!info) {
    if (path.length !== 0) {
      `Got incorrect path: ${path} that has to be empty array!`;
    }

    return composeAllFieldsProjection(entityConfig);
  }

  return getSimpleProjectionFromInfo(info, path);
};

export default getProjectionFromInfo;
