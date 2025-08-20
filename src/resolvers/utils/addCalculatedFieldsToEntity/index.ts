import { DataObject, InfoEssence, ResolverArg, TangibleEntityConfig } from '../../../tsTypes';

const addCalculatedFieldsToEntity = (
  data: DataObject,
  infoEssence: InfoEssence,
  asyncResolverResults: Record<string, any>,
  resolverArg: ResolverArg,
  entityConfig: TangibleEntityConfig,
  index: number,
) => {
  const { calculatedFields = [] } = entityConfig;

  if (calculatedFields.length === 0) {
    return data;
  }

  const { projection, fieldArgs } = infoEssence;

  const result = { ...data };

  calculatedFields.reduce((prev, { func, name }) => {
    if (projection[name] === 1) {
      const args = fieldArgs[name];

      prev[name] = func(args, data, resolverArg, asyncResolverResults[name], index);
    }

    return prev;
  }, result);

  return result;
};

export default addCalculatedFieldsToEntity;
