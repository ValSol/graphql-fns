// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createThing from '../../../mongooseModels/createThing';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import addIdsToThing from '../../utils/addIdsToThing';
import executeAuthorisation from '../../utils/executeAuthorisation';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import incCounters from '../incCounters';
import processForPushEach from './processForPushEach';
import processCreateInputData from '../processCreateInputData';
import updatePeriphery from '../updatePeriphery';

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

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    info: Object,
    parentFilter: Array<Object>,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const {
      whereOne,
      whereOne: { id },
      data,
    } = args;

    const { mongooseConn } = context;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    let _id = id; // eslint-disable-line no-underscore-dangle
    const whereOne2 = id ? { _id } : whereOne;
    const { lookups, where: whereOne3 } = mergeWhereAndFilter(filter, whereOne, thingConfig);

    let conditions = whereOne3;

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(whereOne3).length) {
        arg.push({ $match: whereOne3 });
      }

      arg.push({ $project: { _id: 1 } });

      const [thing] = await Thing.aggregate(arg).exec();

      if (!thing) return null;

      conditions = { _id: thing._id }; // eslint-disable-line no-underscore-dangle
    }

    let previousThing = {};
    const subscriptionInventoryChain = ['Subscription', 'updatedThing', name];
    const allowSubscription = checkInventory(subscriptionInventoryChain, inventory);
    if (whereOne === whereOne2 || allowSubscription) {
      const projection = allowSubscription
        ? {} // if subsciption ON - return empty projection - to get all fields of thing
        : { _id: 1 };

      previousThing = await Thing.findOne(conditions, projection, { lean: true });
      if (!previousThing) return null;
      _id = previousThing._id; // eslint-disable-line no-underscore-dangle
    }
    if (filter.length) {
      const thing = Thing.findOne(conditions, { _id: 1 }, { lean: true });
      if (!thing) return null;
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
      true, // for update
    );

    await updatePeriphery(periphery, mongooseConn);

    if (!single) {
      const coreWithCounters = await incCounters(core, mongooseConn);

      const promises = [];
      coreWithCounters.forEach((bulkItems, config) => {
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
      if (
        !inAnyCase &&
        (await executeAuthorisation(subscriptionInventoryChain, context, serversideConfig))
      ) {
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
