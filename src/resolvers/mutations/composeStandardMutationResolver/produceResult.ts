import type {
  GeneralConfig,
  GraphqlObject,
  Periphery,
  EntityConfig,
  TangibleEntityConfig,
  ResolverArg,
} from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';

type PreparedData = {
  core: Core;
  periphery: Periphery;
  mains: GraphqlObject[];
};

const produceResult = async (
  preparedData: PreparedData,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  resolverArg: ResolverArg,
  array: boolean,
): Promise<Array<GraphqlObject>> => {
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

  if (array) {
    const ids = mains.map(({ _id }) => _id);

    const entities = await Entity.find({ _id: { $in: ids } }, projection, { lean: true });

    const entities2 = entities.map((item) =>
      addCalculatedFieldsToEntity(
        addIdsToEntity(item, entityConfig),
        projection,
        resolverArg,
        entityConfig as TangibleEntityConfig,
      ),
    );

    return entities2;
  }

  // eslint-disable-next-line no-underscore-dangle
  const entity = await Entity.findById(first._id, projection, { lean: true });

  const entity2 = addCalculatedFieldsToEntity(
    addIdsToEntity(entity, entityConfig),
    projection,
    resolverArg,
    entityConfig as TangibleEntityConfig,
  );

  return [entity2];
};

export default produceResult;
