// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingQueryResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { name } = thingConfig;

    const Thing = mongooseConn.model(name, thingSchema);

    const whereKeys = Object.keys(where);
    if (whereKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
    const conditions = where.id ? { _id: where.id } : where;

    const projection = getProjectionFromInfo(info);

    const thing = await Thing.findOne(conditions, projection, { lean: true });
    if (!thing) return null;

    const { _id } = thing;

    thing.id = _id;
    return thing;
  };

  return resolver;
};

module.exports = createThingQueryResolver;
