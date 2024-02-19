import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

import type { ProjectionInfo, SintheticResolverInfo } from '../../../tsTypes';

import getFieldArgsFromResolvedInfo from './getFieldArgsFromResolvedInfo';

const projectionTypePredicate = (info: SintheticResolverInfo): info is ProjectionInfo =>
  Boolean((info as ProjectionInfo).projection);

const getFieldArgsFromInfo = (
  fieldName: string,
  info: SintheticResolverInfo,
  path: string[] = [],
): {
  [fieldName: string]: 1;
} => {
  if (!info || projectionTypePredicate(info)) {
    return {};
    // throw new TypeError(`Got sinthetic resolver info with projection: "${info.projection}"!`);
  }

  const resolvedInfo = parseResolveInfo(info as GraphQLResolveInfo);

  if (!resolvedInfo) {
    throw new TypeError(
      `Got resolver info = "${String(info)}" but had to be GraphQLResolveInfo Object!`,
    );
  }

  return getFieldArgsFromResolvedInfo(fieldName, resolvedInfo, path);
};

export default getFieldArgsFromInfo;
