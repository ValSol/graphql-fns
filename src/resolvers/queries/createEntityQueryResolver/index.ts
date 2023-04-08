import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addIdsToEntity from '../../utils/addIdsToEntity';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  whereOne: {
    id: string;
  };
};

const createNodeQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any | null => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain: InventoryСhain = ['Query', 'entity', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: any,
    args: Args,
    context: Context,
    info: any,
    involvedFilters: {
      [derivativeConfigName: string]: null | Array<any>;
    },
  ): Promise<any> => {
    const filter = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { whereOne } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }

    const projection: { [fieldName: string]: 1 } = info ? getProjectionFromInfo(info) : { _id: 1 };

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, whereOne, entityConfig);

    if (lookups.length) {
      const pipeline = [...lookups];

      if (Object.keys(conditions).length) {
        pipeline.push({ $match: conditions });
      }

      pipeline.push({ $project: projection });

      const [entity] = await Entity.aggregate(pipeline).exec();

      if (!entity) return null;

      const entity2 = addIdsToEntity(entity, entityConfig);
      return entity2;
    }

    const entity = await Entity.findOne(conditions, projection, { lean: true });

    if (!entity) return null;

    const entity2 = addIdsToEntity(entity, entityConfig);
    return entity2;
  };

  return resolver;
};

export default createNodeQueryResolver;
