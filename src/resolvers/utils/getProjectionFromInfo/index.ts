import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

import type { ProjectionInfo, SintheticResolverInfo } from '../../../tsTypes';

type Path = Array<string>;

const projectionTypePredicate = (info: SintheticResolverInfo): info is ProjectionInfo =>
  Boolean((info as ProjectionInfo).projection);

const getProjectionFromInfo = (
  info: SintheticResolverInfo,
  path: Path = [],
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

  const { fieldsByTypeName } = resolvedInfo;
  const [fieldsTree] = Object.values(fieldsByTypeName);

  let fieldsTreeByPath = fieldsTree;

  path.forEach((item) => {
    fieldsTreeByPath = Object.values(fieldsTreeByPath[item].fieldsByTypeName)[0];
  });

  const fields = Object.keys(fieldsTreeByPath)
    .reduce((prev, key) => {
      const { name } = fieldsTreeByPath[key];

      if (!prev.includes(name)) {
        prev.push(name);
      }

      return prev;
    }, [])
    .filter((field) => !['id', '__typename'].includes(field));

  if (fields.length === 0) {
    return { _id: 1 } as Record<string, 1>;
  }

  return fields.reduce<Record<string, 1>>((prev, field) => {
    if (field.endsWith('ThroughConnection')) {
      prev[`${field.slice(0, -'ThroughConnection'.length)}`] = 1;
    } else {
      prev[field] = 1;
    }
    return prev;
  }, {});
};

export default getProjectionFromInfo;
