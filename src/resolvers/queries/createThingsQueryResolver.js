// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where?: Object, pagination?: { skip: number, first: number } };
type Context = { mongooseConn: Object };

const createThingsQueryResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { pagination, where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { name } = thingConfig;

    const Thing = mongooseConn.model(name, thingSchema);
    const conditions = where || { where };
    const projection = getProjectionFromInfo(info);

    let query = Thing.find(conditions, projection, { lean: true });
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

module.exports = createThingsQueryResolver;
