import { GraphQLResolveInfo } from 'graphql';
import { ResolveTree, parseResolveInfo } from 'graphql-parse-resolve-info';

import type { ProjectionInfo, SintheticResolverInfo } from '../../../tsTypes';

type Path = Array<string>;

const projectionTypePredicate = (info: SintheticResolverInfo): info is ProjectionInfo =>
  Boolean((info as ProjectionInfo).projection);

const getSimpleProjectionFromInfo = (
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

  const fieldsTree = Object.keys(fieldsByTypeName).reduce((prev, key) => {
    Object.assign(prev, fieldsByTypeName[key]);

    return prev;
  }, {});

  let fieldsTreeByPath = fieldsTree;

  path.forEach((item) => {
    fieldsTreeByPath = Object.values(fieldsTreeByPath[item].fieldsByTypeName)[0] as ResolveTree;
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
    } else if (field.endsWith('GetOrCreate')) {
      prev[`${field.slice(0, -'GetOrCreate'.length)}`] = 1;
      prev._id = 1; // to connect with created Entity
    } else if (field.endsWith('Count')) {
      prev[field] = 1; // we can have NOT generated field that ends by "Count"
      prev[`${field.slice(0, -'Count'.length)}`] = 1;
    } else if (field.endsWith('DistinctValues')) {
      prev[`${field.slice(0, -'DistinctValues'.length)}`] = 1;
    } else if (field.endsWith('Stringified')) {
      prev[field] = 1; // we can have NOT generated field that ends by "Stringified"
      prev[`${field.slice(0, -'Stringified'.length)}`] = 1;
    } else {
      prev[field] = 1;
    }
    return prev;
  }, {});
};

export default getSimpleProjectionFromInfo;
