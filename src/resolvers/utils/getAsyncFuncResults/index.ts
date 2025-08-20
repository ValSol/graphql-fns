import {
  InfoEssence,
  ResolverArg,
  ResolverCreatorArg,
  TangibleEntityConfig,
} from '../../../tsTypes';

const getAsyncFuncResults = async (
  infoEssence: InfoEssence,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
): Promise<Record<string, any>> => {
  const { entityConfig } = resolverCreatorArg;

  const { calculatedFields = [] } = entityConfig as TangibleEntityConfig;

  if (calculatedFields.length === 0) {
    return {};
  }

  const result = {};

  const { projection, fieldArgs } = infoEssence;

  for (let i = 0; i < calculatedFields.length; i += 1) {
    const { asyncFunc, name } = calculatedFields[i];

    if (asyncFunc && projection[name] === 1) {
      const args = fieldArgs[name];

      result[name] = await asyncFunc(args, resolverCreatorArg, resolverArg);
    }
  }

  return result;
};

export default getAsyncFuncResults;
