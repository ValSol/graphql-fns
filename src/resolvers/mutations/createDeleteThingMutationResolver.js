// @flow
import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import processDeleteData from './processDeleteData';

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object, pubsub?: Object };

// TODO update to remove garbage from relation fields that relate to deleted object
const createDeleteThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  if (!checkInventory(['Mutation', 'deleteThing', name], inventory)) return null;

  const resolver = async (_: Object, args: Args, context: Context): Object => {
    const { whereOne } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(name, thingSchema);

    const whereOneKeys = Object.keys(whereOne);
    if (whereOneKeys.length !== 1) {
      throw new TypeError('Expected exactly one key in where arg!');
    }
    const conditions = whereOne.id ? { _id: whereOne.id } : whereOne;

    const thing = await Thing.findOne(conditions, null, { lean: true });
    if (!thing) return null;

    const { _id } = thing;

    await Thing.findOneAndDelete({ _id });

    const promises = [];
    const bulkItemsMap = processDeleteData(thing, thingConfig);
    bulkItemsMap.forEach((bulkItems, config) => {
      const { name: name2 } = config;
      const thingSchema2 = createThingSchema(config, enums);
      const Thing2 = mongooseConn.model(name2, thingSchema2);
      promises.push(Thing2.bulkWrite(bulkItems));
    });

    await Promise.all(promises);

    thing.id = _id;

    if (checkInventory(['Subscription', 'deletedThing', name], inventory)) {
      const { pubsub } = context;
      if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
      pubsub.publish(`deleted-${name}`, { [`deleted${name}`]: thing });
    }

    return thing;
  };

  return resolver;
};

export default createDeleteThingMutationResolver;
