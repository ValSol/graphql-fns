import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

import type { InfoEssence, SintheticResolverInfo } from '@/tsTypes';

import getFieldArgsFromResolvedInfo from './getFieldArgsFromResolvedInfo';
import infoEssenceTypePredicate from '../infoEssenceTypePredicate';

const getSeparateFieldArgsFromInfo = (
  fieldName: string,
  info: SintheticResolverInfo,
  path: string[] = [],
): {
  [fieldName: string]: 1;
} => {
  if (!info || infoEssenceTypePredicate(info)) {
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

export default getSeparateFieldArgsFromInfo;
