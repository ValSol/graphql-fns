// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThing from '../../mongooseModels/createThing';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import getProjectionFromInfo from '../getProjectionFromInfo';
import mergeWhereAndFilter from '../mergeWhereAndFilter';
import composeNearInput from './composeNearInput';
import composeSortInput from './composeSortInput';

type Args = {
  where?: Object,
  near?: NearInput,
  sort?: { sortBy: Array<string> },
  pagination?: { skip: number, first: number },
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
    parentFilter: Object,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { near, pagination, sort, where } = args;

    const { mongooseConn } = context;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    let query = Thing.find({}, projection, { lean: true });

    if (near) query = query.where(composeNearInput(near));

    const where2 = mergeWhereAndFilter(filter, where, thingConfig);
    if (where2) query = query.where(where2);

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
