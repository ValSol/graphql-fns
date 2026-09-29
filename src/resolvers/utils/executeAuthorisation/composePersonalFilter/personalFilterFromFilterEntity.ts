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

  const user = await composeQueryResolver(
    userEntityName,
    generalConfig,
    serversideConfig,
  )(
    null,
    { whereOne: { id: userAttributes.id } },
    context,
    createInfoEssence({ projection: { [filterEntityPointerName]: 1 } }),
    { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
  );

  // no User record or no pointer means no access, as for a user without "id"
  const filterEntityPointer = user?.[filterEntityPointerName];

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

  const filterEntity = await composeQueryResolver(
    filterEntityConfig.name,
    generalConfig,
    serversideConfig,
  )(
    null,
    { whereOne: { id: filterEntityPointer } },
    context,
    createInfoEssence({ projection: { [filterFieldName]: 1 } }),
    { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
  );

  // the pointer may point to a deleted record
  return filterEntity ? filterEntity[filterFieldName] : null;
};

export default personalFilterFromFilterEntity;
