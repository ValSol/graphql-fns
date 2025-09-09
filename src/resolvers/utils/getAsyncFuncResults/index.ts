import { InfoEssence, ResolverArg, ResolverCreatorArg, TangibleEntityConfig } from '@/tsTypes';

const getAsyncFuncResults = async (
  infoEssence: InfoEssence,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
): Promise<Record<string, any>> => {
  const { entityConfig } = resolverCreatorArg;

  const { calculatedFields = [] } = entityConfig as TangibleEntityConfig;

  const { projection, fieldArgs } = infoEssence;

  const asyncCalculatedFieldsToProcess = calculatedFields.filter(
    ({ asyncFunc, name }) => asyncFunc && projection[name] === 1,
  );

  if (asyncCalculatedFieldsToProcess.length === 0) {
    return {};
  }

  const results = await Promise.all(
    asyncCalculatedFieldsToProcess.map(({ asyncFunc, name }) => {
      const args = fieldArgs[name];

      return asyncFunc(args, resolverCreatorArg, resolverArg);
    }),
  );

  return asyncCalculatedFieldsToProcess.reduce((prev, { name }, i) => {
    prev[name] = results[i];

    return prev;
  }, {});
};

export default getAsyncFuncResults;
