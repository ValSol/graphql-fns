import { GeneralConfig, ServersideConfig, TangibleEntityConfig } from '@/tsTypes';
import composeQueryResolver from '../../composeQueryResolver';
import createInfoEssence from '../../createInfoEssence';

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
    createInfoEssence({ [filterEntityPointerName]: 1 }),
    { involvedFilters: { inputOutputEntity: [[]] } },
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
    createInfoEssence({ [filterFieldName]: 1 }),
    { involvedFilters: { inputOutputEntity: [[]] } },
  );

  return filterField;
};

export default personalFilterFromFilterEntity;
