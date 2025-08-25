import { GeneralConfig, ServersideConfig } from '@/tsTypes';
import composeQueryResolver from '../../composeQueryResolver';
import createInfoEssence from '../../createInfoEssence';

const personalFilterFromUserEntity = async (
  personalFiltersTuple: [string, string, string],
  userAttributes: Record<string, any>,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const [userEntityName, , filterFieldName] = personalFiltersTuple;

  const { [filterFieldName]: filterField } = await composeQueryResolver(
    userEntityName,
    generalConfig,
    serversideConfig,
  )(
    null,
    { whereOne: { id: userAttributes.id } },
    context,
    createInfoEssence({ [filterFieldName]: 1 }),
    { involvedFilters: { inputOutputEntity: [[]] } },
  );

  return filterField;
};

export default personalFilterFromUserEntity;
