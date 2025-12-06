import type { ResolverArg, TangibleEntityConfig } from '@/tsTypes';

import getSimpleProjectionFromInfo from '../getSimpleProjectionFromInfo';
import composeAllFieldsProjection from '../composeAllFieldsProjection';
import adaptProjectionForCalculatedFields from '../adaptProjectionForCalculatedFields';

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

  const projection = getSimpleProjectionFromInfo(info, path);

  return adaptProjectionForCalculatedFields(projection, entityConfig);
};

export default getProjectionFromInfo;
