// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import type { PreparedData } from '../../flowTypes';

import addIdsToThing from '../../utils/addIdsToThing';
import checkInventory from '../../../utils/checkInventory';
import sleep from '../../../utils/sleep';
import incCounters from '../incCounters';
import updatePeriphery from '../updatePeriphery';
import executeBulkItems from '../composeStandardMutationResolver/executeBulkItems';
import produceResult from '../composeStandardMutationResolver/produceResult';
import mutationsResolverAttributes from './mutationsResolverAttributes';

type StandardMutationsArgs = Array<{
  actionGeneralName: string,
  thingConfig: ThingConfig,
  inAnyCase?: boolean,
  parent?: Object,
  args: Object,
  info?: Object,
  parentFilter?: Array<Object>,
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

  let preparedData = preparedBulkData;

  const previouses = [];
  for (let i = 0; i < standardMutationsArgs.length; i += 1) {
    const mutationArgs = standardMutationsArgs[i];

    const {
      actionGeneralName,
      thingConfig,
      inAnyCase,
      parent: parentInArgs,
      args,
      info: infoInArgs,
      parentFilter: parentFilterInArgs,
    } = mutationArgs;

    const parent = parentInArgs || null;
    const info = infoInArgs || { projection: {} };
    const parentFilter = parentFilterInArgs || [];

    const { getPrevious, prepareBulkData } = mutationsResolverAttributes[actionGeneralName];

    const { name } = thingConfig;

    const inventoryChain = ['Mutation', actionGeneralName, name];
    if (!inAnyCase && !checkInventory(inventoryChain, inventory)) {
      throw new TypeError(`Not authorized "${actionGeneralName}" mutation for "${name}" thing!`);
    }

    const resolverCreatorArg = {
      thingConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    };

    const resolverArg = {
      parent,
      args,
      context,
      info,
      parentFilter,
    };

    // eslint-disable-next-line no-await-in-loop
    const previous = await getPrevious(actionGeneralName, resolverCreatorArg, resolverArg);

    if (!previous) {
      throw new TypeError(
        `Not got preivous for "${actionGeneralName}" mutation for "${name}" thing!`,
      );
    }

    const { core, periphery } = preparedData;
    const preparedData2 = { core, periphery, mains: previous };
    // eslint-disable-next-line no-await-in-loop
    preparedData = await prepareBulkData(resolverCreatorArg, resolverArg, preparedData2);
    if (!preparedData) {
      throw new TypeError(
        `Not got preparedData for "${actionGeneralName}" mutation for "${name}" thing!`,
      );
    }

    previouses.push(previous);
  }

  const { core, periphery } = preparedData;
  const { mongooseConn } = context;

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

    // second try to execute the same functionality in a new transaction

    const session2 = transactions ? await mongooseConn.startSession() : null;

    if (!session2) {
      throw new Error(err);
    }

    await sleep(50);

    try {
      if (session2) {
        session2.startTransaction();
      }

      if (periphery && periphery.size) {
        await updatePeriphery(periphery, mongooseConn);
      }

      const coreWithCounters = await incCounters(core, mongooseConn);

      await executeBulkItems(coreWithCounters, generalConfig, context, session2);

      if (session2) {
        await session2.commitTransaction();
        session2.endSession();
      }
    } catch (err2) {
      if (session2) {
        await session2.abortTransaction();
        session2.endSession();
      }

      throw new Error(err2);
    }
  }

  const finalResults = [];

  for (let i = 0; i < standardMutationsArgs.length; i += 1) {
    const mutationArgs = standardMutationsArgs[i];

    const {
      actionGeneralName,
      thingConfig,
      inAnyCase,
      parent: parentInArgs,
      args,
      info: infoInArgs,
      parentFilter: parentFilterInArgs,
      returnReport,
      returnResult,
    } = mutationArgs;

    const parent = parentInArgs || null;
    const info = infoInArgs || { projection: {} };
    const parentFilter = parentFilterInArgs || [];

    const { array, produceCurrent, report, finalResult } = mutationsResolverAttributes[
      actionGeneralName
    ];

    const resolverCreatorArg = {
      thingConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    };

    const resolverArg = {
      parent,
      args,
      context,
      info,
      parentFilter,
    };

    const previous = previouses[i];
    const result = returnResult ? {} : null;

    if (result) {
      result.previous = previous.map((item) => addIdsToThing(item, thingConfig));
    }

    if (result && produceCurrent) {
      const fakePreparedData = { core: new Map(), periphery: new Map(), mains: previous };
      // eslint-disable-next-line no-await-in-loop
      result.current = await produceResult(
        fakePreparedData,
        thingConfig,
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
