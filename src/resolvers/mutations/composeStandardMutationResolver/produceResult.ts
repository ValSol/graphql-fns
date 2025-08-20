import pluralize from 'pluralize';

import type {
  GraphqlObject,
  Periphery,
  ResolverCreatorArg,
  TangibleEntityConfig,
  ResolverArg,
} from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import composeAllFieldsProjection from '../../utils/composeAllFieldsProjection';
import composeQueryResolver from '../../utils/composeQueryResolver';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
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
  } = resolverCreatorArg;

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
    involvedFilters: { subscribeCreatedEntity, subscribeDeletedEntity, subscribeUpdatedEntity },
  } = resolverArg;

  const infoEssence = getInfoEssence(entityConfig as TangibleEntityConfig, info);

  const { projection } = infoEssence;

  if (subscribeCreatedEntity || subscribeDeletedEntity || subscribeUpdatedEntity) {
    Object.assign(projection, composeAllFieldsProjection(entityConfig), {
      withoutCalculatedFieldsWithAsyncFunc: true,
    });
  }

  if (array) {
    return await composeQueryResolver(pluralize(entityName), generalConfig, serversideConfig)(
      null,
      { where: { id_in: mains.map(({ _id }) => _id) }, token },
      context,
      infoEssence,
      { inputOutputEntity: [[]] },
    );
  }

  const instance = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
    null,
    { whereOne: { id: first._id }, token },
    context,
    infoEssence,
    { inputOutputEntity: [[]] },
  );

  return [instance];
};

export default produceResult;
