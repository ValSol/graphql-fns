// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import checkInventory from '../../utils/checkInventory';
import setByPositions from '../../utils/setByPositions';
import createThing from '../../mongooseModels/createThing';
import createThingSchema from '../../mongooseModels/createThingSchema';
import addIdsToThing from '../addIdsToThing';
import executeAuthorisation from '../executeAuthorisation';
import mergeWhereAndFilter from '../mergeWhereAndFilter';
import incCounters from './incCounters';
import processCreateInputData from './processCreateInputData';
import processDeleteData from './processDeleteData';
import processDeleteDataPrepareArgs from './processDeleteDataPrepareArgs';
import updatePeriphery from './updatePeriphery';

type Args = { data: Object, whereOne: Object, positions: { [key: string]: Array<number> } };
type Context = { mongooseConn: Object, pubsub?: Object };

const createUpdateThingMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'updateThing', name];
  if (!inAnyCase && !checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (
    parent: Object,
    args: Args,
    context: Context,
    ino: Object,
    parentFilter: Object,
  ): Object => {
    const filter = inAnyCase
      ? parentFilter
      : await executeAuthorisation(inventoryChain, context, serversideConfig);
    if (!filter) return null;

    const { mongooseConn } = context;
    const { whereOne, data, positions } = args;

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const { duplexFields } = thingConfig;
    const duplexFieldsProjection = duplexFields
      ? duplexFields.reduce(
          (prev, { name: name2 }) => {
            prev[name2] = 1; // eslint-disable-line no-param-reassign
            return prev;
          },
          { _id: 1 },
        )
      : {};

    const { lookups, where: whereOne2 } = mergeWhereAndFilter(filter, whereOne, thingConfig);

    let whereOne3 = whereOne2;

    if (lookups.length) {
      const arg = [...lookups];

      if (Object.keys(whereOne2).length) {
        arg.push({ $match: whereOne2 });
      }

      arg.push({ $project: { _id: 1 } });

      const [thing] = await Thing.aggregate(arg).exec();

      if (!thing) return null;

      whereOne3 = { _id: thing._id }; // eslint-disable-line no-underscore-dangle
    }

    const projection = checkInventory(['Subscription', 'updatedThing', name], inventory)
      ? {} // if subsciption ON - return empty projection - to get all fields of thing
      : duplexFieldsProjection;

    const previousThing = await Thing.findOne(whereOne3, projection, { lean: true });

    if (!previousThing) return null;

    const coreForDeletions = Object.keys(duplexFieldsProjection).length
      ? processDeleteData(
          processDeleteDataPrepareArgs(data, previousThing, thingConfig),
          thingConfig,
        )
      : null;

    const {
      core,
      periphery,
      single,
      first: { _id, ...rest },
    } = processCreateInputData(
      { ...data, id: previousThing._id }, // eslint-disable-line no-underscore-dangle
      coreForDeletions,
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

    let thing = await Thing.findOneAndUpdate({ _id }, rest, {
      new: true,
      lean: true,
    });

    if (positions) {
      const data2 = {};

      Object.keys(positions).forEach((key) => {
        if (!data[key].create) {
          throw new TypeError(`There is not "create" field in "${key}" field to set positions!`);
        }
        if (data[key].create.length !== positions[key].length) {
          throw new TypeError(
            `Number of created childs: "${data[key].create.length}" but number of positions: "${positions[key].length}"!`,
          );
        }
        data2[key] = setByPositions(thing[key], positions[key]);
      });

      thing = await Thing.findOneAndUpdate({ _id }, data2, {
        new: true,
        lean: true,
      });
    }

    const thing2 = addIdsToThing(thing, thingConfig);

    const subscriptionInventoryChain = ['Subscription', 'updatedThing', name];
    if (checkInventory(subscriptionInventoryChain, inventory)) {
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

export default createUpdateThingMutationResolver;
