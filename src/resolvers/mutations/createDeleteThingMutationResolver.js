// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import processDeleteData from './processDeleteData';

type Args = { whereOne: { id: string } };
type Context = { mongooseConn: Object, pubsub?: Object };

// TODO update to remove garbage from relation fields that relate to deleted object
const createDeleteThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'deleteThing', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    const credentials = await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { whereOne } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

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
      const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
      promises.push(Thing2.bulkWrite(bulkItems));
    });

    await Promise.all(promises);

    const thing2 = addIdsToThing(thing, thingConfig);

    const subscriptionInventoryChain = ['Subscription', 'deletedThing', name];
    if (checkInventory(subscriptionInventoryChain, inventory)) {
      await executeAuthorisation({
        inventoryChain: subscriptionInventoryChain,
        resolverArgs,
        serversideConfig,
        credentials,
      });
      const { pubsub } = context;
      if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
      pubsub.publish(`deleted-${name}`, { [`deleted${name}`]: thing2 });
    }

    return thing2;
  };

  return resolver;
};

export default createDeleteThingMutationResolver;
