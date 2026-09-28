import { DataObject, InfoEssence, ResolverArg, ResolverCreatorArg } from '@/tsTypes';

import getCalculatedFieldCallbacks from '../getCalculatedFieldCallbacks';
import getCalculatedFieldsConfig from '../getCalculatedFieldsConfig';

const addCalculatedFieldsToEntity = (
  data: DataObject,
  infoEssence: InfoEssence,
  asyncResolverResults: Record<string, any>,
  resolverArg: ResolverArg,
  resolverCreatorArg: ResolverCreatorArg,
  index: number,
) => {
  const { generalConfig, serversideConfig } = resolverCreatorArg;

  const calculatedFieldsConfig = getCalculatedFieldsConfig(resolverCreatorArg, resolverArg);

  const { calculatedFields = [] } = calculatedFieldsConfig;

  if (calculatedFields.length === 0) {
    return data;
  }

  const { projection, fieldArgs } = infoEssence;

  const result = { ...data };

  calculatedFields.reduce((prev, { name }) => {
    if (projection[name] === 1) {
      const args = fieldArgs[name];

      const { func } = getCalculatedFieldCallbacks(
        calculatedFieldsConfig,
        name,
        generalConfig,
        serversideConfig,
      );

      prev[name] = func(args, data, resolverArg, asyncResolverResults[name], index);
    }

    return prev;
  }, result);

  return result;
};

export default addCalculatedFieldsToEntity;
