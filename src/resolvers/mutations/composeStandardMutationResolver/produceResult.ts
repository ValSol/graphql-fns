import type {
  Context,
  DataObject,
  GeneralConfig,
  GraphqlObject,
  Periphery,
  EntityConfig,
} from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addIdsToEntity from '../../utils/addIdsToEntity';

type PreparedData = {
  core: Core;
  periphery: Periphery;
  mains: GraphqlObject[];
};

const produceResult = async (
  preparedData: PreparedData,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  context: Context,
  array: boolean,
): Promise<Array<GraphqlObject>> => {
  const { enums } = generalConfig;
  const { mongooseConn } = context;
  const {
    mains,
    mains: [first],
  } = preparedData;

  const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

  if (array) {
    const ids = mains.map(({ _id }) => _id);

    const entities = await Entity.find({ _id: { $in: ids } }, null, { lean: true });

    const entities2 = entities.map((item) => addIdsToEntity(item, entityConfig));

    return entities2;
  }

  // eslint-disable-next-line no-underscore-dangle
  const entity = await Entity.findById(first._id, null, { lean: true });

  const entity2 = addIdsToEntity(entity, entityConfig);

  return [entity2];
};

export default produceResult;
