// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import processForPushEach from './processForPushEach';
import processCreateInputData from './processCreateInputData';
import updatePeriphery from './updatePeriphery';

type Args = { whereOne: Object, data: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createPushIntoThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'pushIntoThing', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context): Object => {
    if (!(await executeAuthorisation(inventoryChain, context, serversideConfig))) return null;

    const {
      whereOne,
      whereOne: { id },
      data,
    } = args;

    const { mongooseConn } = context;

    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(`${name}_Thing`, thingSchema);

    let _id = id; // eslint-disable-line no-underscore-dangle
    const whereOne2 = id ? { _id } : whereOne;

    let previousThing = {};
    const subscriptionInventoryChain = ['Subscription', 'updatedThing', name];
    const allowSubscription = checkInventory(subscriptionInventoryChain, inventory);
    if (whereOne === whereOne2 || allowSubscription) {
      const projection = allowSubscription
        ? {} // if subsciption ON - return empty projection - to get all fields of thing
        : { _id: 1 };

      previousThing = await Thing.findOne(whereOne2, projection, { lean: true });
      _id = previousThing._id; // eslint-disable-line no-underscore-dangle
    }

    const {
      core,
      periphery,
      single,
      first: { _id: _id2, ...rest },
    } = processCreateInputData(
      { ...data, id: _id },
      null,
      null,
      thingConfig,
      true, // forConcatenation
    );

    await updatePeriphery(periphery, mongooseConn);

    if (!single) {
      const promises = [];
      core.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);
    }
    const dataForConcatenation = processForPushEach(rest);
    const thing = await Thing.findOneAndUpdate({ _id }, dataForConcatenation, {
      new: true,
      lean: true,
    });

    const thing2 = addIdsToThing(thing, thingConfig);

    if (allowSubscription) {
      if (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig)) {
        const { pubsub } = context;
        if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
        const updatedFields = Object.keys(data);

        const payload = {
          node: thing2,
          previousNode: addIdsToThing(previousThing, thingConfig),
          updatedFields,
        };
        pubsub.publish(`updated-${name}`, { [`updated${name}`]: payload });
      }
    }

    return thing2;
  };

  return resolver;
};

export default createPushIntoThingMutationResolver;
