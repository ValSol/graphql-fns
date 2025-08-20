import { ResolveTree } from 'graphql-parse-resolve-info';

const getFieldArgsFromResolvedInfo = (
  fieldName: string,
  resolvedInfo: any,
  path: string[] = [],
): Record<string, any> => {
  const { fieldsByTypeName } = resolvedInfo;

  const fieldsTree = Object.keys(fieldsByTypeName).reduce((prev, key) => {
    Object.assign(prev, fieldsByTypeName[key]);

    return prev;
  }, {});

  let fieldsTreeByPath = fieldsTree;

  path.forEach((item) => {
    fieldsTreeByPath = Object.values(fieldsTreeByPath[item].fieldsByTypeName).reduce(
      (prev, item) => {
        Object.assign(prev, item);

        return prev;
      },
      {},
    ) as ResolveTree;
  });

  return fieldsTreeByPath[fieldName]?.args || null;
};

export default getFieldArgsFromResolvedInfo;
