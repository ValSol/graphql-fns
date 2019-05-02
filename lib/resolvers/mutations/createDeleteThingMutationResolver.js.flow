// @flow
import type { ThingConfig } from '../../flowTypes';

const createThingSchema = require('../../mongooseModels/createThingSchema');
const processDeleteData = require('./processDeleteData');

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

// TODO update to remove garbage from relation fields that relate to deleted object
const createDeleteThingMutationResolver = (thingConfig: ThingConfig): Function => {
  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { where } = args;

    const { mongooseConn } = context;

    const { name } = thingConfig;
    const thingSchema = createThingSchema(thingConfig);
    const Thing = mongooseConn.model(name, thingSchema);

    const whereKeys = Object.keys(where);
    if (whereKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
    const conditions = where.id ? { _id: where.id } : where;

    const thing = await Thing.findOne(conditions, null, { lean: true });
    if (!thing) return null;

    const { _id } = thing;

    await Thing.findOneAndDelete({ _id });

    const promises = [];
    const bulkItemsMap = processDeleteData(thing, thingConfig);
    bulkItemsMap.forEach((bulkItems, config) => {
      const { name: name2 } = config;
      const thingSchema2 = createThingSchema(config);
      const Thing2 = mongooseConn.model(name2, thingSchema2);
      promises.push(Thing2.bulkWrite(bulkItems));
    });

    await Promise.all(promises);

    thing.id = _id;
    return thing;
  };

  return resolver;
};

module.exports = createDeleteThingMutationResolver;
