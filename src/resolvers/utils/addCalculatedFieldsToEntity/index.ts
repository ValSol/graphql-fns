import { DataObject, ResolverArg, TangibleEntityConfig } from '../../../tsTypes';

const addCalculatedFieldsToEntity = (
  data: DataObject,
  projection: Record<string, 1>,
  resolverArg: ResolverArg,
  entityConfig: TangibleEntityConfig,
) => {
  const { calculatedFields = [] } = entityConfig;

  if (calculatedFields.length === 0) {
    return data;
  }

  const result = { ...data };

  const emptyProjection = Object.keys(projection).length === 0;

  calculatedFields.reduce((prev, { func, name }) => {
    if (!emptyProjection && projection[name] === undefined) {
      return prev;
    }

    prev[name] = func(data, resolverArg);

    return prev;
  }, result);

  return result;
};

export default addCalculatedFieldsToEntity;
