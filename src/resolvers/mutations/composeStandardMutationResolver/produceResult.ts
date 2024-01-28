import type {
  GraphqlObject,
  Periphery,
  ResolverCreatorArg,
  TangibleEntityConfig,
  ResolverArg,
} from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import getAsyncFuncResults from '../../utils/getAsyncFuncResults';

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
  const { entityConfig, generalConfig } = resolverCreatorArg;

  const { enums } = generalConfig;
  const {
    context: { mongooseConn },
  } = resolverArg;
  const {
    mains,
    mains: [first],
  } = preparedData;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

  const asyncFuncResults = await getAsyncFuncResults(projection, resolverCreatorArg, resolverArg);

  if (array) {
    const ids = mains.map(({ _id }) => _id);

    const entities = await Entity.find({ _id: { $in: ids } }, projection, { lean: true });

    const entities2 = entities.map((item, i) =>
      addCalculatedFieldsToEntity(
        addIdsToEntity(item, entityConfig),
        projection,
        asyncFuncResults,
        resolverArg,
        entityConfig as TangibleEntityConfig,
        i,
      ),
    );

    return entities2;
  }

  // eslint-disable-next-line no-underscore-dangle
  const entity = await Entity.findById(first._id, projection, { lean: true });

  const entity2 = addCalculatedFieldsToEntity(
    addIdsToEntity(entity, entityConfig),
    projection,
    asyncFuncResults,
    resolverArg,
    entityConfig as TangibleEntityConfig,
    0, // index
  );

  return [entity2];
};

export default produceResult;
