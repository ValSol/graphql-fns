// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import setByPositions from '../../utils/setByPositions';
import createThing from '../../mongooseModels/createThing';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import processCreateInputData from './processCreateInputData';
import updatePeriphery from './updatePeriphery';

type Args = { data: Object, positions: { [key: string]: Array<number> } };
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
    if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
      return null;
    }

    const { data, positions } = args;
    const { mongooseConn } = context;

    const { core, periphery, single, first } = processCreateInputData(
      data,
      null,
      null,
      thingConfig,
    );

    const Thing = await createThing(mongooseConn, thingConfig, enums);

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

    if (positions) {
      const data2 = {};

      Object.keys(positions).forEach((key) => {
        if (!data[key].create) {
          throw new TypeError(`There is not "create" field in "${key}" field to set positions!`);
        }
        data2[key] = setByPositions(thing[key], positions[key]);
      });

      // eslint-disable-next-line no-underscore-dangle
      thing = await Thing.findOneAndUpdate({ _id: first._id }, data2, {
        new: true,
        lean: true,
      });
    }

    const thing2 = addIdsToThing(thing, thingConfig);

    const subscriptionInventoryChain = ['Subscription', 'createdThing', name];
    if (checkInventory(subscriptionInventoryChain, inventory)) {
      if (
        !inAnyCase &&
        (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig))
      ) {
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
