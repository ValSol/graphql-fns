import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

import type { SintheticResolverInfo } from '../../../tsTypes';

import getSimpleProjectionFromResolvedInfo from './getSimpleProjectionFromResolvedInfo';
import infoEssenceTypePredicate from '../infoEssenceTypePredicate';

const getSimpleProjectionFromInfo = (
  info: SintheticResolverInfo,
  path: string[] = [],
): {
  [fieldName: string]: 1;
} => {
  if (infoEssenceTypePredicate(info)) {
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
