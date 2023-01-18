// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createMongooseModel from '../../../mongooseModels/createMongooseModel';
import addIdsToEntity from '../../utils/addIdsToEntity';
import composeNearForAggregateInput from '../../utils/composeNearForAggregateInput';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import composeNearInput from './composeNearInput';
import composeSortForAggregateInput from './composeSortForAggregateInput';
import composeSortInput from './composeSortInput';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
  search?: string,
  // "objectIds_from_parent" used only to process the call from createEntityArrayResolver
  objectIds_from_parent?: Array<Object>,
};

const createEntitiesQueryResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = entityConfig;

  const inventoryChain = ['Query', 'entities', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    involvedFilters: { [derivativeConfigName: string]: Array<Object> },
  ): Object => {
    const { inputOutputEntity: filter } = involvedFilters;

    if (!filter) return null;

    const {
      near,
      pagination,
      sort,
      where,
      search,
      objectIds_from_parent: objectIdsFromParent,
    } = args;

    // very same code as ...
    // ...at: src/resolvers/queries/createEntitiesThroughConnectionQueryResolver/getShift/index.js

    const { mongooseConn } = context;

    const Entity = await createMongooseModel(mongooseConn, entityConfig, enums);

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

    if (lookups.length || objectIdsFromParent) {
      const pipeline = [...lookups];

      if (near) {
        const geoNear = composeNearForAggregateInput(near);

        pipeline.unshift({ $geoNear: geoNear });
      }

      if (search) {
        pipeline.unshift({ $sort: { score: { $meta: 'textScore' } } });
        pipeline.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(where2).length) {
        pipeline.push({ $match: where2 });
      }

      if (sort) {
        const { sortBy } = sort;
        const sortInputs = composeSortForAggregateInput(sortBy);
        Array.prototype.push.apply(pipeline, sortInputs);
      }

      if (objectIdsFromParent) {
        pipeline.push({
          $set: { index_from_parent_ids: { $indexOfArray: [objectIdsFromParent, '$_id'] } },
        });
        pipeline.push({ $sort: { index_from_parent_ids: 1 } });
      }

      if (pagination) {
        const { skip, first: limit } = pagination;

        if (skip > 0) {
          pipeline.push({ $skip: skip });
        }

        if (limit > 0) {
          pipeline.push({ $limit: limit });
        }
      }

      if (!search) {
        // not use "$project" if used "search" to prevent error: field names may not start with '$'
        pipeline.push({ $project: projection });
      }

      const entities = await Entity.aggregate(pipeline).exec();

      if (!entities) return [];

      const result = entities.map((item) => addIdsToEntity(item, entityConfig));

      return result;
    }

    let query = Entity.find({}, projection, { lean: true });

    if (near) query = query.where(composeNearInput(near));

    if (Object.keys(where2).length) query = query.where(where2);

    if (search) query = query.where({ $text: { $search: search } });

    if (sort) {
      const { sortBy } = sort;
      const composedSortBy = composeSortInput(sortBy);
      composedSortBy.forEach((sortItem) => query.sort(sortItem));
    }

    if (pagination) {
      const { skip, first: limit } = pagination;
      query = query.skip(skip).limit(limit);
    }

    const entities = await query.exec();
    if (!entities) return [];

    const result = entities.map((item) => addIdsToEntity(item, entityConfig));

    return result;
  };

  return resolver;
};

export default createEntitiesQueryResolver;
