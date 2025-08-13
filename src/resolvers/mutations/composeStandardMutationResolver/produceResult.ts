import pluralize from 'pluralize';

import type {
  GraphqlObject,
  Periphery,
  ResolverCreatorArg,
  TangibleEntityConfig,
  ResolverArg,
} from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import composeAllFieldsProjection from '../../utils/composeAllFieldsProjection';
import composeQueryResolver from '../../utils/composeQueryResolver';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';

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

  const { enums } = generalConfig;
  const {
    context,
    context: { mongooseConn },
  } = resolverArg;
  const {
    mains,
    mains: [first],
  } = preparedData;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const {
    involvedFilters: { subscribeCreatedEntity, subscribeDeletedEntity, subscribeUpdatedEntity },
  } = resolverArg;

  const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

  if (subscribeCreatedEntity || subscribeDeletedEntity || subscribeUpdatedEntity) {
    Object.assign(projection, composeAllFieldsProjection(entityConfig), {
      withoutCalculatedFieldsWithAsyncFunc: true,
    });
  }

  if (array) {
    return await composeQueryResolver(pluralize(entityName), generalConfig, serversideConfig)(
      null,
      { where: { id_in: mains.map(({ _id }) => _id) } },
      context,
      { projection },
      { inputOutputEntity: [[]] },
    );
  }

  const instance = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
    null,
    { whereOne: { id: first._id } },
    context,
    { projection },
    { inputOutputEntity: [[]] },
  );

  return [instance];
};

export default produceResult;
