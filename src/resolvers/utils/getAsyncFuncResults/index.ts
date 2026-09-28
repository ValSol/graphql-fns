import { InfoEssence, ResolverArg, ResolverCreatorArg } from '@/tsTypes';

import getCalculatedFieldCallbacks from '../getCalculatedFieldCallbacks';
import getCalculatedFieldsConfig from '../getCalculatedFieldsConfig';

const getAsyncFuncResults = async (
  infoEssence: InfoEssence,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  notAsyncCalculatedFieldValues: any,
): Promise<Record<string, any>> => {
  const { generalConfig, serversideConfig } = resolverCreatorArg;

  const calculatedFieldsConfig = getCalculatedFieldsConfig(resolverCreatorArg, resolverArg);

  const { calculatedFields = [] } = calculatedFieldsConfig;

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
        calculatedFieldsConfig,
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
