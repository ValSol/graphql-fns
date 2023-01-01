// @flow
import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { PreparedData } from '../../flowTypes';

import addIdsToEntity from '../../utils/addIdsToEntity';
import checkInventory from '../../../utils/inventory/checkInventory';
import sleep from '../../../utils/sleep';
import incCounters from '../incCounters';
import addPeripheryToCore from '../addPeripheryToCore';
import executeBulkItems from '../executeBulkItems';
import optimizeBulkItems from '../optimizeBulkItems';
import produceResult from '../composeStandardMutationResolver/produceResult';
import mutationsResolverAttributes from './mutationsResolverAttributes';

type StandardMutationsArgs = Array<{
  actionGeneralName: string,
  entityConfig: EntityConfig,
  inAnyCase?: boolean,
  parent?: Object,
  args: Object,
  info?: Object,
  parentFilters?: { foo: Array<Object> },
  returnReport?: boolean,
  returnResult: boolean,
}>;

type CommonResolverCreatorArg = {
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
};

const workOutMutations = async (
  standardMutationsArgs: StandardMutationsArgs,
  commonResolverCreatorArg: CommonResolverCreatorArg,
  preparedBulkData?: PreparedData = { core: new Map(), periphery: new Map(), mains: [] },
): Promise<Array<any>> => {
  const { generalConfig, serversideConfig, context } = commonResolverCreatorArg;
  const { inventory } = generalConfig;
  const { transactions } = serversideConfig;
  const { mongooseConn } = context;

  let previouses = [];

  const tryCount = 7;

  for (let j = 0; j < tryCount; j += 1) {
    let preparedData = preparedBulkData;
    // eslint-disable-next-line no-await-in-loop
    const session = transactions ? await mongooseConn.startSession() : null;

    try {
      if (session) {
        session.startTransaction();
      }

      previouses = [];
      for (let i = 0; i < standardMutationsArgs.length; i += 1) {
        const mutationArgs = standardMutationsArgs[i];

        const {
          actionGeneralName,
          entityConfig,
          inAnyCase,
          parent: parentInArgs,
          args,
          info: infoInArgs,
          parentFilters: parentFiltersInArgs,
        } = mutationArgs;

        const parent = parentInArgs || null;
        const info = infoInArgs || { projection: {} };
        const parentFilters = parentFiltersInArgs || { foo: [] };

        const { getPrevious, prepareBulkData } = mutationsResolverAttributes[actionGeneralName];

        const { name } = entityConfig;

        const inventoryChain = ['Mutation', actionGeneralName, name];
        if (!inAnyCase && !checkInventory(inventoryChain, inventory)) {
          throw new TypeError(
            `Not authorized "${actionGeneralName}" mutation for "${name}" entity!`,
          );
        }

        const resolverCreatorArg = {
          entityConfig,
          generalConfig,
          serversideConfig,
          inAnyCase,
        };

        const resolverArg = {
          parent,
          args,
          context,
          info,
          parentFilters,
        };

        // eslint-disable-next-line no-await-in-loop
        const previous = await getPrevious(actionGeneralName, resolverCreatorArg, resolverArg);

        if (!previous) {
          throw new TypeError(
            `Not got preivous for "${actionGeneralName}" mutation for "${name}" entity!`,
          );
        }

        const { core, periphery } = preparedData;
        const preparedData2 = { core, periphery, mains: previous };
        // eslint-disable-next-line no-await-in-loop
        preparedData = await prepareBulkData(resolverCreatorArg, resolverArg, preparedData2);
        if (!preparedData) {
          throw new TypeError(
            `Not got preparedData for "${actionGeneralName}" mutation for "${name}" entity!`,
          );
        }

        previouses.push(previous);
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
      await executeBulkItems(coreWithCounters, generalConfig, context, null);

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

      if (j === tryCount - 1) {
        throw new Error(err);
      }

      // eslint-disable-next-line no-await-in-loop
      await sleep(2 ** j * 10);
    }
  }
  const finalResults = [];

  for (let i = 0; i < standardMutationsArgs.length; i += 1) {
    const mutationArgs = standardMutationsArgs[i];

    const {
      actionGeneralName,
      entityConfig,
      inAnyCase,
      parent: parentInArgs,
      args,
      info: infoInArgs,
      parentFilters: parentFiltersInArgs,
      returnReport,
      returnResult,
    } = mutationArgs;

    const parent = parentInArgs || null;
    const info = infoInArgs || { projection: {} };
    const parentFilters = parentFiltersInArgs || { foo: [] };

    const { array, produceCurrent, report, finalResult } =
      mutationsResolverAttributes[actionGeneralName];

    const resolverCreatorArg = {
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    };

    const resolverArg = {
      parent,
      args,
      context,
      info,
      parentFilters,
    };

    const previous = previouses[i];
    const result = returnResult ? {} : null;

    if (result) {
      result.previous = previous.map((item) => addIdsToEntity(item, entityConfig));
    }

    if (result && produceCurrent) {
      const fakePreparedData = { core: new Map(), periphery: new Map(), mains: previous };
      // eslint-disable-next-line no-await-in-loop
      result.current = await produceResult(
        fakePreparedData,
        entityConfig,
        generalConfig,
        context,
        array,
      );
    }

    if (result && returnReport) {
      // eslint-disable-next-line no-await-in-loop
      const subscription = await report(resolverCreatorArg, resolverArg);
      if (subscription) {
        subscription(result);
      }
    }

    finalResults.push(result && finalResult(result));
  }

  return finalResults;
};

export default workOutMutations;
