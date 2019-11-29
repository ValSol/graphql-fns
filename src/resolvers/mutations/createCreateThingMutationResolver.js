// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';
import processCreateInputData from './processCreateInputData';
import updatePeriphery from './updatePeriphery';

type Args = { data: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createCreateThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'createThing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    const credentials = await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { data } = args;
    const { mongooseConn } = context;

    const { core, periphery, single, first } = processCreateInputData(
      data,
      null,
      null,
      thingConfig,
    );

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(name, thingSchema);

    await updatePeriphery(periphery, mongooseConn);

    let thing;
    if (single) {
      const result = await Thing.create(first);
      thing = result.toObject();
    } else {
      const promises = [];
      core.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(name2, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);
      // eslint-disable-next-line no-underscore-dangle
      thing = await Thing.findById(first._id, null, { lean: true });
    }

    const { _id } = thing;
    thing.id = _id;

    const subscriptionInventoryChain = ['Subscription', 'createdThing', name];
    if (checkInventory(subscriptionInventoryChain, inventory)) {
      await executeAuthorisation({
        inventoryChain: subscriptionInventoryChain,
        resolverArgs,
        serversideConfig,
        credentials,
      });
      const { pubsub } = context;
      if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
      pubsub.publish(`created-${name}`, { [`created${name}`]: thing });
    }

    return thing;
  };

  return resolver;
};

export default createCreateThingMutationResolver;
