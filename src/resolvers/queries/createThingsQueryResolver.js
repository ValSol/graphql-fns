// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where?: Object };
type Context = { mongooseConn: Object };

const createThingsQueryResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { name } = thingConfig;

    const Thing = mongooseConn.model(name, thingSchema);
    const projection = getProjectionFromInfo(info);

    const things = await Thing.find({}, projection, { lean: true });
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
