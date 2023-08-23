import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  GraphqlScalar,
  NearInput,
  SintheticResolverInfo,
  InvolvedFilter,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import composeNearForAggregateInput from '../../utils/composeNearForAggregateInput';
import getFilterFromInvolvedFilters from '../../utils/getFilterFromInvolvedFilters';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import composeNearInput from '../utils/composeNearInput';

type Args = {
  where?: any;
  near?: NearInput;
  search?: string;
  options: {
    target: string;
  };
};

const createEntityDistinctValuesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): any => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;
  const inventoryChain: InventoryСhain = ['Query', 'entityDistinctValues', name];
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

    if (!filter) return [];

    const {
      near,
      search,
      where,
      options: { target },
    } = args;

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig) || {};

    if (lookups.length > 0) {
      const pipeline = [...lookups];

      if (near) {
        const geoNear = composeNearForAggregateInput(near);

        pipeline.unshift({ $geoNear: geoNear });
      }

      if (search) {
        pipeline.unshift({ $sort: { score: { $meta: 'textScore' } } });
        pipeline.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(where2).length > 0) {
        pipeline.push({ $match: where2 });
      }

      pipeline.push({ $project: { _id: 1 } });

      const ids = await Entity.aggregate(pipeline).exec();

      const result = await Entity.distinct(target, { _id: { $in: ids } });

      return result.filter(Boolean);
    }

    let query = Entity.distinct(target);

    if (near) query = query.where(composeNearInput(near));

    if (Object.keys(where2).length > 0) query = query.where(where2);

    if (search) query = query.where({ $text: { $search: search } });

    const result = await query.exec();

    return result.filter(Boolean);

    // const result = await Entity.distinct(target, where2);

    // return result.filter(Boolean);
  };

  return resolver;
};

export default createEntityDistinctValuesQueryResolver;
