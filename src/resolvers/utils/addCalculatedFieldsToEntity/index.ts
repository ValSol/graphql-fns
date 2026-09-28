import {
  DataObject,
  InfoEssence,
  ResolverArg,
  ResolverCreatorArg,
  TangibleEntityConfig,
} from '@/tsTypes';

import getCalculatedFieldCallbacks from '../getCalculatedFieldCallbacks';

const addCalculatedFieldsToEntity = (
  data: DataObject,
  infoEssence: InfoEssence,
  asyncResolverResults: Record<string, any>,
  resolverArg: ResolverArg,
  resolverCreatorArg: ResolverCreatorArg,
  index: number,
) => {
  const { entityConfig, generalConfig, serversideConfig } = resolverCreatorArg;

  const { calculatedFields = [] } = entityConfig as TangibleEntityConfig;

  if (calculatedFields.length === 0) {
    return data;
  }

  const { projection, fieldArgs } = infoEssence;

  const result = { ...data };

  calculatedFields.reduce((prev, { name }) => {
    if (projection[name] === 1) {
      const args = fieldArgs[name];

      const { func } = getCalculatedFieldCallbacks(
        entityConfig,
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
