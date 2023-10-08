import { ResolverArg, TangibleEntityConfig } from '../../../tsTypes';

const getAsyncFuncResults = async (
  projection: Record<string, 1>,
  resolverArg: ResolverArg,
  entityConfig: TangibleEntityConfig,
): Promise<Record<string, any>> => {
  const { calculatedFields = [] } = entityConfig;

  if (calculatedFields.length === 0) {
    return {};
  }

  const result = {};

  for (let i = 0; i < calculatedFields.length; i += 1) {
    const { asyncFunc, name } = calculatedFields[i];

    if (asyncFunc && projection[name] === 1) {
      result[name] = await asyncFunc(resolverArg);
    }
  }

  return result;
};

export default getAsyncFuncResults;
