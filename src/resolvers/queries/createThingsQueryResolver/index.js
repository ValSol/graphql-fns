// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createThing from '../../../mongooseModels/createThing';
import addIdsToThing from '../../utils/addIdsToThing';
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
type Context = { mongooseConn: Object };

const createThingsQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'things', name];
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

    const { mongooseConn } = context;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    const { lookups, where: where2 } = mergeWhereAndFilter(filter, where, thingConfig);

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

      arg.push({ $project: projection });

      const things = await Thing.aggregate(arg).exec();

      if (!things) return [];

      const result = things.map((item) => addIdsToThing(item, thingConfig));

      return result;
    }

    let query = Thing.find({}, projection, { lean: true });

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

    const things = await query.exec();
    if (!things) return [];

    const result = things.map((item) => addIdsToThing(item, thingConfig));

    return result;
  };

  return resolver;
};

export default createThingsQueryResolver;
