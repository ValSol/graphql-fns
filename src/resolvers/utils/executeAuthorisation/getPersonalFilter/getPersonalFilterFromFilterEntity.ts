import { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '../../../../tsTypes';
import createEntityQueryResolver from '../../../queries/createEntityQueryResolver';

const getPersonalFilterFromFilterEntity = async (
  personalFiltersTuple: [string, string, string],
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  store: Record<string, any>,
  token?: string,
) => {
  const [userEntityName, filterEntityPointerName, filterFieldName] = personalFiltersTuple;

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

  const { [filterEntityPointerName]: filterEntityPointer } = await store[userEntityName](
    null,
    { whereOne: { id: userAttributes.id } },
    context,
    { projection: { [filterEntityPointerName]: 1 } },
    { inputOutputEntity: [[]] },
  );

  if (!filterEntityPointer) {
    return null;
  }

  // *** find filter entity

  const { relationalFields = [], duplexFields = [] } = allEntityConfigs[
    userEntityName
  ] as TangibleEntityConfig;

  const { config: filterEntityConfig } = [...relationalFields, ...duplexFields].find(
    ({ name }) => name === filterEntityPointerName,
  );

  // ***

  if (!store[filterEntityConfig.name]) {
    store[filterEntityConfig.name] = createEntityQueryResolver(
      filterEntityConfig,
      generalConfig,
      serversideConfig,
      true, // inAnyCase,
    );
    if (!store[filterEntityConfig.name]) {
      throw new Error('query "Complex" was not created!');
    }
  }

  const { [filterFieldName]: filterField } = await store[filterEntityConfig.name](
    null,
    { whereOne: { id: filterEntityPointer } },
    context,
    { projection: { [filterEntityPointerName]: 1 } },
    { inputOutputEntity: [[]] },
  );

  return filterField;
};

export default getPersonalFilterFromFilterEntity;
