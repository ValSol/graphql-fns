// @flow

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

const checkInventory = require('../../utils/checkInventory');
const createThingSchema = require('../../mongooseModels/createThingSchema');
const getProjectionFromInfo = require('../getProjectionFromInfo');

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object };

const createThingQueryResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  if (!checkInventory(['Query', 'thing', name], inventory)) return null;

  const resolver = async (_: Object, args: Args, context: Context, info: Object): Object => {
    const { whereOne } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);

    const Thing = mongooseConn.model(name, thingSchema);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in whereOne arg!');
    }
    const conditions = whereOne.id ? { _id: whereOne.id } : whereOne;

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
