import { ResolverArg, ResolverCreatorArg, TangibleEntityConfig } from '../../../tsTypes';
import getFieldArgsFromInfo from '../getFieldArgsFromInfo';

const getAsyncFuncResults = async (
  projection: Record<string, 1>,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
): Promise<Record<string, any>> => {
  const { entityConfig } = resolverCreatorArg;

  const { calculatedFields = [] } = entityConfig as TangibleEntityConfig;

  if (calculatedFields.length === 0) {
    return {};
  }

  const result = {};

  for (let i = 0; i < calculatedFields.length; i += 1) {
    const { asyncFunc, name } = calculatedFields[i];

    if (asyncFunc && projection[name] === 1) {
      const args = getFieldArgsFromInfo(name, resolverArg.info, []);

      result[name] = await asyncFunc(args, resolverCreatorArg, resolverArg);
    }
  }

  return result;
};

export default getAsyncFuncResults;
