// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import createThing from '../../../mongooseModels/createThing';
import createThingSchema from '../../../mongooseModels/createThingSchema';
import addIdsToThing from '../../utils/addIdsToThing';
import executeAuthorisation from '../../utils/executeAuthorisation';
import incCounters from '../incCounters';
import processCreateInputData from '../processCreateInputData';
import updatePeriphery from '../updatePeriphery';

type Args = { data: Object };
type Context = { mongooseConn: Object, pubsub?: Object };

const createCreateManyThingsMutationResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
): Function | null => {
  const { enums, inventory } = generalConfig;
  const { name } = thingConfig;
  const inventoryChain = ['Mutation', 'createThing', name];
  const inventoryChain2 = ['Mutation', 'createManyThings', name];
  if (
    !inAnyCase &&
    (!checkInventory(inventoryChain, inventory) || !checkInventory(inventoryChain2, inventory))
  ) {
    return null;
  }

  const resolver = async (parent: Object, args: Args, context: Context): Object => {
    if (!inAnyCase && !(await executeAuthorisation(inventoryChain, context, serversideConfig))) {
      return null;
    }
    if (!inAnyCase && !(await executeAuthorisation(inventoryChain2, context, serversideConfig))) {
      return null;
    }

    const { data } = args;

    // code beneath is identical to code from createImportThingsMutationResolver

    const { mongooseConn } = context;

    let overallCore = null;
    let overallPeriphery = null;
    const mains = [];

    data.forEach((dataItem) => {
      const { core, periphery } = processCreateInputData(
        dataItem,
        mains,
        overallCore,
        overallPeriphery,
        thingConfig,
        'create',
      );
      // eslint-disable-next-line no-underscore-dangle
      overallCore = core;
      overallPeriphery = periphery;
    });

    const ids = mains.map(({ _id }) => _id);

    // if check to eliminate flowjs error
    if (overallPeriphery && overallCore) {
      await updatePeriphery(overallPeriphery, mongooseConn);

      const coreWithCounters = await incCounters(overallCore, mongooseConn);

      const promises = [];
      coreWithCounters.forEach((bulkItems, config) => {
        const { name: name2 } = config;
        const thingSchema2 = createThingSchema(config, enums);
        const Thing2 = mongooseConn.model(`${name2}_Thing`, thingSchema2);
        promises.push(Thing2.bulkWrite(bulkItems));
      });

      await Promise.all(promises);
    }

    const Thing = await createThing(mongooseConn, thingConfig, enums);

    const things = await Thing.find({ _id: { $in: ids } }, null, { lean: true });

    const things2 = things.map((item) => addIdsToThing(item, thingConfig));
    return things2;
  };

  return resolver;
};

export default createCreateManyThingsMutationResolver;
