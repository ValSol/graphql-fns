import { GeneralConfig, ServersideConfig } from '../../../../tsTypes';
import createEntityQueryResolver from '../../../queries/createEntityQueryResolver';

const personalFilterFromUserEntity = async (
  personalFiltersTuple: [string, string, string],
  userAttributes: Record<string, any>,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  store: Record<string, any>,
) => {
  const [userEntityName, , filterFieldName] = personalFiltersTuple;

  const { allEntityConfigs } = generalConfig;

  if (!store[userEntityName]) {
    store[userEntityName] = createEntityQueryResolver(
      allEntityConfigs[userEntityName],
      generalConfig,
      serversideConfig,
      true, // inAnyCase,
    );
    if (!store[userEntityName]) {
      throw new Error('query "Complex" was not created!');
    }
  }

  const { [filterFieldName]: filterField } = await store[userEntityName](
    null,
    { whereOne: { id: userAttributes.id } },
    context,
    { projection: { [filterFieldName]: 1 } },
    { inputOutputEntity: [[]] },
  );

  return filterField;
};

export default personalFilterFromUserEntity;
