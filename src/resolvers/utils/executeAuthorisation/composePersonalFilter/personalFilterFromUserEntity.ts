import { GeneralConfig, ServersideConfig } from '../../../../tsTypes';
import composeQueryResolver from '../../composeQueryResolver';

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
    { projection: { [filterFieldName]: 1 }, fieldArgs: {}, path: [] },
    { inputOutputEntity: [[]] },
  );

  return filterField;
};

export default personalFilterFromUserEntity;
