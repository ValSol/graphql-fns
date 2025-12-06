import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

import type { InfoEssence, SintheticResolverInfo, TangibleEntityConfig } from '@/tsTypes';

import adaptProjectionForCalculatedFields from '../adaptProjectionForCalculatedFields';
import composeAllFieldsProjection from '../composeAllFieldsProjection';
import createInfoEssence from '../createInfoEssence';
import getSimpleProjectionFromResolvedInfo from '../getSimpleProjectionFromInfo/getSimpleProjectionFromResolvedInfo';
import infoEssenceTypePredicate from '../infoEssenceTypePredicate';
import getFieldArgsFromResolvedInfo from './getFieldArgsFromResolvedInfo';

const getInfoEssence = (
  entityConfig: TangibleEntityConfig,
  info: SintheticResolverInfo,
  path: string[] = [],
): InfoEssence => {
  if (!info) {
    if (path.length !== 0) {
      `Got incorrect path: ${path} that has to be empty array!`;
    }

    return createInfoEssence(composeAllFieldsProjection(entityConfig));
  }

  if (infoEssenceTypePredicate(info)) {
    const projection = adaptProjectionForCalculatedFields(info.projection, entityConfig);

    return { ...info, projection };
  }

  const resolvedInfo = parseResolveInfo(info as GraphQLResolveInfo);

  if (!resolvedInfo) {
    throw new TypeError(
      `Got resolver info = "${String(info)}" but had to be GraphQLResolveInfo Object!`,
    );
  }

  const simpleProjection = getSimpleProjectionFromResolvedInfo(resolvedInfo, path);

  const projection = adaptProjectionForCalculatedFields(simpleProjection, entityConfig);

  const fieldArgs = Object.keys(projection).reduce(
    (prev, fieldName) => {
      const fieldArgs = getFieldArgsFromResolvedInfo(fieldName, resolvedInfo, path);

      if (fieldArgs) {
        prev[fieldName] = fieldArgs;
      }

      return prev;
    },
    {} as Record<string, any>,
  );

  return { projection, fieldArgs, path, originalInfo: info };
};

export default getInfoEssence;
