// @flow

import type { GeneralConfig, NearInput, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
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
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  if (!checkInventory(['Query', 'things', name], inventory)) return null;

  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { near, pagination, sort, where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(name, thingSchema);
    const composedNear = near && composeNearInput(near);
    const conditions = composedNear || where || {};
    const projection = info ? getProjectionFromInfo(info) : { _id: 1 };

    let query = Thing.find(conditions, projection, { lean: true });

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
