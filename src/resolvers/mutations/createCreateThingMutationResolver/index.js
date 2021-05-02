// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createThing from '../../../mongooseModels/createThing';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import addIdsToThing from '../../utils/addIdsToThing';
import executeAuthorisation from '../../utils/executeAuthorisation';
import checkData from '../checkData';
import incCounters from '../incCounters';
import processCreateInputData from '../processCreateInputData';
import updatePeriphery from '../updatePeriphery';

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

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
      return null;
    }

    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) return null;

    const { data } = args;

    const toCreate = true;
    const allowCreate = await checkData(
      data,
      filter,
      thingConfig,
      toCreate,
      generalConfig,
      serversideConfig,
      context,
    );

    if (!allowCreate) return null;

    const { mongooseConn } = context;

    const {
      core,
      periphery,
      mains: [first],
    } = processCreateInputData(data, [], null, null, thingConfig);

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    await updatePeriphery(periphery, mongooseConn);

    const coreWithCounters = await incCounters(core, mongooseConn);
    const promises = [];
    coreWithCounters.forEach((bulkItems, config) => {
      const { name: name2 } = config;
      const thingSchema2 = createThingSchema(config, enums);
      const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
      promises.push(Thing2.bulkWrite(bulkItems));
    });
    await Promise.all(promises);
    // eslint-disable-next-line no-underscore-dangle
    const thing = await Thing.findById(first._id, null, { lean: true });

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
