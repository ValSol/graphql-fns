// @flow

import type { GeneralConfig, NearInput, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';
import getProjectionFromInfo from '../getProjectionFromInfo';
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
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;

  const inventoryChain = ['Query', 'things', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { near, pagination, sort, where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);
    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    let query = Thing.find({}, projection, { lean: true });

    if (near) query = query.where(composeNearInput(near));

    if (where) query = query.where(where);

    if (sort) {
      const { sortBy } = sort;
      const composedSortBy = composeSortInput(sortBy);
      composedSortBy.forEach(sortItem => query.sort(sortItem));
    }

    if (pagination) {
      const { skip, first: limit } = pagination;
      query = query.skip(skip).limit(limit);
    }

    const things = await query.exec();
    if (!things) return [];

    const result = things.map(item => {
      const { _id } = item;
      return { ...item, id: _id };
    });

    return result;
  };

  return resolver;
};

export default createThingsQueryResolver;
