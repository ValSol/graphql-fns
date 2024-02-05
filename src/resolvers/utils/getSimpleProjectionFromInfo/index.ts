import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

import type { ProjectionInfo, SintheticResolverInfo } from '../../../tsTypes';

import getSimpleProjectionFromResolvedInfo from './getSimpleProjectionFromResolvedInfo';

const projectionTypePredicate = (info: SintheticResolverInfo): info is ProjectionInfo =>
  Boolean((info as ProjectionInfo).projection);

const getSimpleProjectionFromInfo = (
  info: SintheticResolverInfo,
  path: string[] = [],
): {
  [fieldName: string]: 1;
} => {
  if (projectionTypePredicate(info)) {
    return info.projection;
  }

  const resolvedInfo = parseResolveInfo(info as GraphQLResolveInfo);

  if (!resolvedInfo) {
    throw new TypeError(
      `Got resolver info = "${String(info)}" but had be GraphQLResolveInfo Object!`,
    );
  }

  return getSimpleProjectionFromResolvedInfo(resolvedInfo, path);
};

export default getSimpleProjectionFromInfo;
