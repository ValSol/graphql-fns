import { DataObject, ResolverArg, TangibleEntityConfig } from '../../../tsTypes';

const addCalculatedFieldsToEntity = (
  data: DataObject,
  projection: Record<string, 1>,
  asyncResolverResults: Record<string, any>,
  resolverArg: ResolverArg,
  entityConfig: TangibleEntityConfig,
  index: number,
) => {
  const { calculatedFields = [] } = entityConfig;

  if (calculatedFields.length === 0) {
    return data;
  }

  const result = { ...data };

  calculatedFields.reduce((prev, { func, name }) => {
    if (projection[name] === 1) {
      prev[name] = func(data, resolverArg, asyncResolverResults[name], index);
    }

    return prev;
  }, result);

  return result;
};

export default addCalculatedFieldsToEntity;
