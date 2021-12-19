// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import type { ResolverAttributes } from '../../flowTypes';

import addIdsToThing from '../../utils/addIdsToThing';
import checkInventory from '../../../utils/inventory/checkInventory';
import sleep from '../../../utils/sleep';
import incCounters from '../incCounters';
import addPeripheryToCore from '../addPeripheryToCore';
import executeBulkItems from '../executeBulkItems';
import optimizeBulkItems from '../optimizeBulkItems';
import produceResult from './produceResult';

type Args = { data: Object, positions: { [key: string]: Array<number> } };
type Context = { mongooseConn: Object, pubsub?: Object };

type Result = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => Function | null;

const composeStandardMutationResolver = (resolverAttributes: ResolverAttributes): Result => {
  const {
    actionGeneralName,
    array,
    getPrevious,
    produceCurrent,
    prepareBulkData,
    report,
    finalResult,
    loophole,
  } = resolverAttributes;

  const createMutationResolver = (
    thingConfig: ThingConfig,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
    inAnyCase?: boolean,
  ): Function | null => {
    const { inventory } = generalConfig;
    const { transactions } = serversideConfig;
    const { name } = thingConfig;

    const inventoryChain = ['Mutation', actionGeneralName, name];
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
      const resolverCreatorArg = {
        thingConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      };

      const resolverArg = { parent, args, context, info, parentFilter };

      if (loophole) {
        return loophole(actionGeneralName, resolverCreatorArg, resolverArg);
      }

      if (!getPrevious) {
        throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
      }
      const previous = await getPrevious(actionGeneralName, resolverCreatorArg, resolverArg);

      if (!previous) return null;

      if (!prepareBulkData) {
        throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
      }
      const prevPreparedData = { core: new Map(), periphery: new Map(), mains: previous };
      const preparedData = await prepareBulkData(resolverCreatorArg, resolverArg, prevPreparedData);

      if (!preparedData) return null;

      const { mongooseConn } = context;

      const { core, periphery } = preparedData;

      const result = {};
      result.previous = previous.map((item) => addIdsToThing(item, thingConfig));

      const coreWithPeriphery =
        periphery && periphery.size
          ? await addPeripheryToCore(periphery, core, mongooseConn)
          : core;

      const optimizedCore = optimizeBulkItems(coreWithPeriphery);

      const tryCount = 7;
      for (let i = 0; i < tryCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const session = transactions ? await mongooseConn.startSession() : null;

        try {
          if (session) {
            session.startTransaction();
          }

          // eslint-disable-next-line no-await-in-loop
          const coreWithCounters = await incCounters(optimizedCore, mongooseConn);

          // eslint-disable-next-line no-await-in-loop
          await executeBulkItems(coreWithCounters, generalConfig, context, session);

          if (session) {
            // eslint-disable-next-line no-await-in-loop
            await session.commitTransaction();
            session.endSession();
          }

          break;
        } catch (err) {
          if (session) {
            // eslint-disable-next-line no-await-in-loop
            await session.abortTransaction();
            session.endSession();
          }

          if (i === tryCount - 1) {
            throw new Error(err);
          }

          // eslint-disable-next-line no-await-in-loop
          await sleep(2 ** i * 10);
        }
      }

      if (produceCurrent) {
        result.current = await produceResult(
          preparedData,
          thingConfig,
          generalConfig,
          context,
          array,
        );
      }

      if (!report) {
        throw new TypeError(`report have to be setted for "${actionGeneralName}"`);
      }
      const subscription = await report(resolverCreatorArg, resolverArg);
      if (subscription) {
        subscription(result);
      }

      if (!finalResult) {
        throw new TypeError(`report have to be setted for "${actionGeneralName}"`);
      }
      return finalResult(result);
    };

    return resolver;
  };

  return createMutationResolver;
};

export default composeStandardMutationResolver;
