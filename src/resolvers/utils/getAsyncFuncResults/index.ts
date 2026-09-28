import { InfoEssence, ResolverArg, ResolverCreatorArg, TangibleEntityConfig } from '@/tsTypes';

import getCalculatedFieldCallbacks from '../getCalculatedFieldCallbacks';

const getAsyncFuncResults = async (
  infoEssence: InfoEssence,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  notAsyncCalculatedFieldValues: any,
): Promise<Record<string, any>> => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;

  const { calculatedFields = [] } = entityConfig as TangibleEntityConfig;

  const { projection, fieldArgs } = infoEssence;

  const asyncCalculatedFieldsToProcess = calculatedFields.filter(
    ({ async, name }) => async && projection[name] === 1,
  );

  if (asyncCalculatedFieldsToProcess.length === 0) {
    return {};
  }

  const results = await Promise.all(
    asyncCalculatedFieldsToProcess.map(({ name }) => {
      const args = fieldArgs[name];

      const { asyncFunc } = getCalculatedFieldCallbacks(
        entityConfig,
        name,
        generalConfig,
        serversideConfig,
      );

      return asyncFunc(args, resolverCreatorArg, resolverArg, notAsyncCalculatedFieldValues);
    }),
  );

  return asyncCalculatedFieldsToProcess.reduce((prev, { name }, i) => {
    prev[name] = results[i];

    return prev;
  }, {});
};

export default getAsyncFuncResults;
