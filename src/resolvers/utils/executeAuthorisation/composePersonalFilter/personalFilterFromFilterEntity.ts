import { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '../../../../tsTypes';
import createEntityQueryResolver from '../../../queries/createEntityQueryResolver';
import composeQueryResolver from '../../composeQueryResolver';

const personalFilterFromFilterEntity = async (
  personalFiltersTuple: [string, string, string],
  userAttributes: Record<string, any>,
  context: any,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
) => {
  const [userEntityName, filterEntityPointerName, filterFieldName] = personalFiltersTuple;

  const { allEntityConfigs } = generalConfig;

  const { [filterEntityPointerName]: filterEntityPointer } = await composeQueryResolver(
    userEntityName,
    generalConfig,
    serversideConfig,
  )(
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

  const { [filterFieldName]: filterField } = await composeQueryResolver(
    filterEntityConfig.name,
    generalConfig,
    serversideConfig,
  )(
    null,
    { whereOne: { id: filterEntityPointer } },
    context,
    { projection: { [filterFieldName]: 1 } },
    { inputOutputEntity: [[]] },
  );

  return filterField;
};

export default personalFilterFromFilterEntity;
