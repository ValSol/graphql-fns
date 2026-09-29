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

  const user = await composeQueryResolver(
    userEntityName,
    generalConfig,
    serversideConfig,
  )(
    null,
    { whereOne: { id: userAttributes.id } },
    context,
    createInfoEssence({ projection: { [filterFieldName]: 1 } }),
    { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
  );

  // no User record means no access, as for a user without "id"
  return user ? user[filterFieldName] : null;
};

export default personalFilterFromUserEntity;
