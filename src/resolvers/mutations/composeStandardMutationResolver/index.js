// @flow
import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { ResolverAttributes, Context } from '../../flowTypes';

import addIdsToEntity from '../../utils/addIdsToEntity';
import checkInventory from '../../../utils/inventory/checkInventory';
import sleep from '../../../utils/sleep';
import incCounters from '../incCounters';
import addPeripheryToCore from '../addPeripheryToCore';
import executeBulkItems from '../executeBulkItems';
import optimizeBulkItems from '../optimizeBulkItems';
import produceResult from './produceResult';

type Args = { data: Object, positions: { [key: string]: Array<number> } };

type Result = (
  entityConfig: EntityConfig,
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
    entityConfig: EntityConfig,
    generalConfig: GeneralConfig,
    serversideConfig: ServersideConfig,
    inAnyCase?: boolean,
  ): Function | null => {
    const { inventory } = generalConfig;
    const { transactions } = serversideConfig;
    const { name } = entityConfig;

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
        entityConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      };

      const resolverArg = { parent, args, context, info, parentFilter };
      const { mongooseConn } = context;

      if (loophole) {
        return loophole(actionGeneralName, resolverCreatorArg, resolverArg);
      }

      const result = {};

      const tryCount = 7;

      let preparedData = {
        core: new Map(),
        periphery: new Map(),
        mains: [],
      };

      for (let i = 0; i < tryCount; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const session = transactions ? await mongooseConn.startSession() : null;

        try {
          if (session) {
            session.startTransaction();
          }

          if (!getPrevious) {
            throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
          }
          // eslint-disable-next-line no-await-in-loop
          const previous = await getPrevious(actionGeneralName, resolverCreatorArg, resolverArg);

          if (!previous) {
            if (session) {
              // eslint-disable-next-line no-await-in-loop
              await session.abortTransaction();
              session.endSession();
            }
            return null;
          }

          result.previous = previous.map((item) => addIdsToEntity(item, entityConfig));

          if (!prepareBulkData) {
            throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
          }
          const prevPreparedData = { core: new Map(), periphery: new Map(), mains: previous };
          // eslint-disable-next-line no-await-in-loop
          preparedData = await prepareBulkData(resolverCreatorArg, resolverArg, prevPreparedData);

          if (!preparedData) {
            if (session) {
              // eslint-disable-next-line no-await-in-loop
              await session.abortTransaction();
              session.endSession();
            }
            return null;
          }

          const { core, periphery } = preparedData;

          const coreWithPeriphery =
            periphery && periphery.size
              ? // eslint-disable-next-line no-await-in-loop
                await addPeripheryToCore(periphery, core, mongooseConn)
              : core;

          const optimizedCore = optimizeBulkItems(coreWithPeriphery);

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
        // eslint-disable-next-line no-await-in-loop
        result.current = await produceResult(
          preparedData,
          entityConfig,
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
