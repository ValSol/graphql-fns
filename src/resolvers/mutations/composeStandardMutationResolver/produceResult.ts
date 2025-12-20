import pluralize from 'pluralize';

import type {
  GraphqlObject,
  Periphery,
  ResolverCreatorArg,
  TangibleEntityConfig,
  ResolverArg,
  GeneralConfig,
  ServersideConfig,
} from '@/tsTypes';
import type { Core } from '@/resolvers/tsTypes';

import { WITHOUT_CALCULATED_WITH_ASYNC } from '@/utils/composeFieldsObject';
import composeAllFieldsProjection from '@/resolvers/utils/composeAllFieldsProjection';
import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';

type PreparedData = {
  core: Core;
  periphery: Periphery;
  mains: GraphqlObject[];
};

const produceResult = async (
  preparedData: PreparedData,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  array: boolean,
): Promise<Array<GraphqlObject>> => {
  const {
    entityConfig,
    entityConfig: { name: entityName },
    generalConfig,
    serversideConfig,
  } = resolverCreatorArg as {
    entityConfig: TangibleEntityConfig;
    generalConfig: GeneralConfig;
    serversideConfig: ServersideConfig;
  };

  const {
    args: { token },
    context,
    info,
  } = resolverArg;
  const {
    mains,
    mains: [first],
  } = preparedData;

  const {
    resolverOptions: { subscriptionEntityNames },
  } = resolverArg;

  const infoEssence =
    subscriptionEntityNames && !array
      ? createInfoEssence({
          projection: composeAllFieldsProjection(entityConfig, WITHOUT_CALCULATED_WITH_ASYNC),
          entityConfig,
          infoEssence: getInfoEssence(entityConfig, info),
        })
      : getInfoEssence(entityConfig, info);

  if (array) {
    return await composeQueryResolver(pluralize(entityName), generalConfig, serversideConfig)(
      null,
      { where: { id_in: mains.map(({ _id }) => _id) }, token },
      context,
      infoEssence,
      { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
    );
  }

  const instance = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
    null,
    { whereOne: { id: first._id }, token },
    context,
    infoEssence,
    { involvedFilters: { inputOutputFilterAndLimit: [[]] } },
  );

  return [instance];
};

export default produceResult;
