// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import type { ResolverAttributes } from '../../flowTypes';

import checkInventory from '../../../utils/checkInventory';
import incCounters from '../incCounters';
import updatePeriphery from '../updatePeriphery';
import executeBulkItems from './executeBulkItems';
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
      result.previous = previous;

      const session = transactions ? await mongooseConn.startSession() : null;
      try {
        if (session) {
          session.startTransaction();
        }

        if (periphery && periphery.size) {
          await updatePeriphery(periphery, mongooseConn);
        }

        const coreWithCounters = await incCounters(core, mongooseConn);

        await executeBulkItems(coreWithCounters, generalConfig, context, session);

        if (session) {
          await session.commitTransaction();
          session.endSession();
        }
      } catch (err) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }

        throw new Error(err);
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
