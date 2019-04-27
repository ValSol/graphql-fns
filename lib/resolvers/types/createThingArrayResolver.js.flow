// @flow

import type { ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const { fieldName } = info;

    const ids = parent[fieldName];

    if (!ids || !ids.length) return [];

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig);
    const { name } = thingConfig;

    const Thing = mongooseConn.model(name, thingSchema);
    const projection = getProjectionFromInfo(info);

    const things = await Thing.find({ _id: { $in: ids } }, projection, { lean: true });

    const things2 = things.map(item => ({
      ...item,
      id: item._id, // eslint-disable-line no-underscore-dangle
    }));

    return things2;
  };

  return resolver;
};

module.exports = createThingScalarResolver;
