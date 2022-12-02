// @flow

import type { GeneralConfig, NearInput, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import createEntity from '../../../mongooseModels/createThing';
import addIdsToEntity from '../../utils/addIdsToEntity';
import executeAuthorisation from '../../utils/executeAuthorisation';
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
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) return null;

    const { near, pagination, sort, where, search } = args;

    // very same code as ...
    // ...at: src/resolvers/queries/createEntitiesThroughConnectionQueryResolver/getShift/index.js

    const { mongooseConn } = context;

    const Entity = await createEntity(mongooseConn, entityConfig, enums);

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, entityConfig);

    if (lookups.length) {
      const arg = [...lookups];

      if (near) {
        const geoNear = composeNearForAggregateInput(near);

        arg.unshift({ $geoNear: geoNear });
      }

      if (search) {
        arg.unshift({ $sort: { score: { $meta: 'textScore' } } });
        arg.unshift({ $match: { $text: { $search: search } } });
      }

      if (Object.keys(where2).length) {
        arg.push({ $match: where2 });
      }

      if (sort) {
        const { sortBy } = sort;
        const sortInputs = composeSortForAggregateInput(sortBy);
        Array.prototype.push.apply(arg, sortInputs);
      }

      if (pagination) {
        const { skip, first: limit } = pagination;

        if (skip > 0) {
          arg.push({ $skip: skip });
        }

        if (limit > 0) {
          arg.push({ $limit: limit });
        }
      }

      if (!search) {
        // not use "$project" if used "search" to prevent error: field names may not start with '$'
        arg.push({ $project: projection });
      }

      const entities = await Entity.aggregate(arg).exec();

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
