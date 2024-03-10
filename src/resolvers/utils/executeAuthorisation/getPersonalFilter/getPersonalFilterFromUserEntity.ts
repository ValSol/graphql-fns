import { GeneralConfig, ServersideConfig } from '../../../../tsTypes';
import createEntityQueryResolver from '../../../queries/createEntityQueryResolver';

const getPersonalFilterFromUserEntity = async (
  personalFiltersTuple: [string, string, string],
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  store: Record<string, any>,
  token?: string,
) => {
  const [userEntityName, , filterFieldName] = personalFiltersTuple;

  const { allEntityConfigs } = generalConfig;

  const { getUserAttributes } = serversideConfig;

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

  const userAttributes = await getUserAttributes(context, token);

  if (!userAttributes?.id) {
    return null;
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

export default getPersonalFilterFromUserEntity;
