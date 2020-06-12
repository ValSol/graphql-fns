// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import processCreateInputData from './processCreateInputData';
import updatePeriphery from './updatePeriphery';

type Args = { data: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createCreateThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'createThing', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) {
    return null;
  }

  const resolver = async (parent: Object, args: Args, context: Context): Object => {
    if (!(await executeAuthorisation(inventoryChain, context, serversideConfig))) return null;

    const { data } = args;
    const { mongooseConn } = context;

    const { core, periphery, single, first } = processCreateInputData(
      data,
      null,
      null,
      thingConfig,
    );

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

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
        const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);
      // eslint-disable-next-line no-underscore-dangle
      thing = await Thing.findById(first._id, null, { lean: true });
    }

    const thing2 = addIdsToThing(thing, thingConfig);

    const subscriptionInventoryChain = ['Subscription', 'createdThing', name];
    if (checkInventory(subscriptionInventoryChain, inventory)) {
      if (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig)) {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        pubsub.publish(`created-${name}`, { [`created${name}`]: thing2 });
      }
    }

    return thing2;
  };

  return resolver;
};

export default createCreateThingMutationResolver;
