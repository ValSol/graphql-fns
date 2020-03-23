// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';
import processUpdateDuplexInputData from './processUpdateDuplexInputData';
import processUpdateInputData from './processUpdateInputData';
import processDeleteData from './processDeleteData';
import updatePeriphery from './updatePeriphery';
import clearUpdateInputData from './clearUpdateInputData';

type Args = { data: Object, whereOne: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createUpdateThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'updateThing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    const credentials = await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { mongooseConn } = context;
    const {
      whereOne,
      whereOne: { id },
      data: rawData,
    } = args;

    // now only remove 'connect'
    // TODO refactor to process 'connect' & 'create'
    const data = clearUpdateInputData(rawData, thingConfig);

    const { name: thingName, duplexFields } = thingConfig;
    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(`${thingName}_Thing`, thingSchema);

    const duplexFieldsProjection = duplexFields
      ? duplexFields.reduce((prev, { name: name2 }) => {
          if (data[name2]) prev[name2] = 1; // eslint-disable-line no-param-reassign
          return prev;
        }, {})
      : {};

    const mainData = processUpdateInputData(data, thingConfig);

    let _id = id; // eslint-disable-line no-underscore-dangle
    const whereOne2 = id ? { _id } : whereOne;

    const projection = checkInventory(['Subscription', 'updatedThing', name], inventory)
      ? {} // if subsciption ON - return empty projection - to get all fields of thing
      : duplexFieldsProjection;

    const previousThing = await Thing.findOne(whereOne2, projection, { lean: true });

    let thing;

    if (Object.keys(duplexFieldsProjection).length) {
      const data2 = { ...data, _id };
      const bulkItemsMap = processDeleteData(previousThing, thingConfig);

      const { core, periphery } = processUpdateDuplexInputData(data2, thingConfig, bulkItemsMap);

      await updatePeriphery(periphery, mongooseConn);

      const promises = [];
      core.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });
      await Promise.all(promises);

      thing = await Thing.findOneAndUpdate({ _id }, mainData, {
        new: true,
        lean: true,
      });
    } else if (id) {
      _id = id;
      thing = await Thing.findOneAndUpdate({ _id }, mainData, { new: true, lean: true });
    } else {
      thing = await Thing.findOneAndUpdate(whereOne, mainData, { new: true, lean: true });
      if (!thing) return null;
      _id = thing._id; // eslint-disable-line no-underscore-dangle, prefer-destructuring
    }

    thing.id = _id;

    const subscriptionInventoryChain = ['Subscription', 'updatedThing', name];
    if (checkInventory(subscriptionInventoryChain, inventory)) {
      await executeAuthorisation({
        inventoryChain: subscriptionInventoryChain,
        resolverArgs,
        serversideConfig,
        credentials,
      });
      const { pubsub } = context;
      if (!pubsub) throw new TypeError('Context have to have pubsub for subscription!'); // to prevent flowjs error
      const updatedFields = Object.keys(data);

      previousThing.id = _id;

      const payload = { node: thing, previousNode: previousThing, updatedFields };
      pubsub.publish(`updated-${name}`, { [`updated${name}`]: payload });
    }

    return thing;
  };

  return resolver;
};

export default createUpdateThingMutationResolver;
