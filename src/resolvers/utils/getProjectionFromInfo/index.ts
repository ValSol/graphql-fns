import type { ResolverArg, TangibleEntityConfig } from '../../../tsTypes';

import getSimpleProjectionFromInfo from '../getSimpleProjectionFromInfo';
import composeAllFieldsProjection from '../composeAllFieldsProjection';
import adaptProjectionForCalculatedFields from '../adaptProjectionForCalculatedFields';

type Path = string[];

const getProjectionFromInfo = (
  entityConfig: TangibleEntityConfig,
  resolverArg: ResolverArg,
  path: Path = [],
) => {
  const { info } = resolverArg;

  if (!info) {
    return composeAllFieldsProjection(entityConfig);
  }

  const projection = getSimpleProjectionFromInfo(info, path);

  return adaptProjectionForCalculatedFields(projection, entityConfig);
};

export default getProjectionFromInfo;
