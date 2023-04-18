import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  NearInput,
  ServersideConfig,
  EntityConfig,
  GraphqlScalar,
  GraphqlObject,
  SintheticResolverInfo,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../utils/composeNearForAggregateInput';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';

type Args = {
  where?: any;
  near?: NearInput;
  search?: string;
};

const createEntityCountQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;
  const inventoryChain: InventoryСhain = ['Query', 'entityCount', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: null | GraphqlObject,
    args: Args,
    context: Context,
    info: SintheticResolverInfo,
    involvedFilters: {
      [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
    },
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { filter } = getFilterFromInvolvedFilters(involvedFilters);

    if (!filter) return null;

    const { near, where, search } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: conditions } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length || near || search) {
      const pipeline = [...lookups];

      if (near) {
        const geoNear = composeNearForAggregateInput(near);

        pipeline.unshift({ $geoNear: geoNear });
      }

      if (search) {
        pipeline.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(conditions).length) {
        pipeline.push({ $match: conditions });
      }

      pipeline.push({ $count: 'count' });

      const [{ count }] = await Entity.aggregate(pipeline).exec();

      return count;
    }

    const result = await Entity.countDocuments(conditions);

    return result;
  };

  return resolver;
};

export default createEntityCountQueryResolver;
