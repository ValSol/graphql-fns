// @flow

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const checkInventory = require('../../utils/checkInventory');
const createThingSchema = require('../../mongooseModels/createThingSchema');

type Args = {
  where?: Object,
};
type Context = { mongooseConn: Object };

const createThingCountQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  if (!checkInventory(['Query', 'thingCount', name], inventory)) return null;

  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { where } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(name, thingSchema);
    const conditions = where || {};

    const result = await Thing.countDocuments(conditions);

    return result;
    /*
    const query = Thing.countDocuments(conditions);

    const things = await query.exec();
    if (!things) return [];

    const result = things.map(item => {
      const { _id } = item;
      return { ...item, id: _id };
    });

    return result;
    */
  };

  return resolver;
};

module.exports = createThingCountQueryResolver;
