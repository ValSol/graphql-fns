// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import createThingSchema from '../../mongooseModels/createThingSchema';
import executeAuthorisation from '../executeAuthorisation';

type Args = { file: Object, options: { target: string }, whereOne: Object }; // todo set DOM file type
type Context = { mongooseConn: Object, pubsub?: Object };

const createUploadFileToThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const { saveFiles } = serversideConfig;
  if (!saveFiles) throw new TypeError('"saveFiles" callback have to be defined!');
  const inventoryChain = ['Mutation', 'uploadFileToThing', name];
  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const resolverArgs = { parent, args, context, info };
    const credentials = await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    // to get data such as: { photo: '/uploaded/cat.png', photoMobile: '/uploaded/mobile/cat.png' }
    const data: { [fileFieldsName: string]: string } = await saveFiles({
      inventoryChain,
      resolverArgs,
      serversideConfig,
    });

    const { mongooseConn } = context;
    const {
      whereOne,
      whereOne: { id },
    } = args;

    const { name: thingName } = thingConfig;
    const thingSchema = createThingSchema(thingConfig, enums);
    const Thing = mongooseConn.model(thingName, thingSchema);

    let _id = id; // eslint-disable-line no-underscore-dangle
    const whereOne2 = id ? { _id } : whereOne;

    const projection = checkInventory(['Subscription', 'updatedThing', name], inventory)
      ? {} // if subsciption ON - return empty projection - to get all fields of thing
      : Object.keys(data).reduce((prev, key) => {
          prev[key] = 1; // eslint-disable-line no-param-reassign
          return prev;
        }, {});

    const previousThing = await Thing.findOne(whereOne2, projection, { lean: true });

    let thing;

    if (id) {
      _id = id;
      thing = await Thing.findOneAndUpdate({ _id }, data, { new: true, lean: true });
    } else {
      thing = await Thing.findOneAndUpdate(whereOne, data, { new: true, lean: true });
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

export default createUploadFileToThingMutationResolver;
