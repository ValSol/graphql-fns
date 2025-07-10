import type { GraphqlObject, InventoryChain, TangibleEntityConfig } from '../../../tsTypes';
import type { Core, PreparedData } from '../../tsTypes';

import sleep from '../../../utils/sleep';
import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import checkInventory from '../../../utils/inventory/checkInventory';
import getAsyncFuncResults from '../../utils/getAsyncFuncResults';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import addPeripheryToCore from '../addPeripheryToCore';
import produceResult from '../composeStandardMutationResolver/produceResult';
import executeBulkItems from '../executeBulkItems';
import incCounters from '../incCounters';
import optimizeBulkItems from '../optimizeBulkItems';
import unwindCore from '../unwindCore';
import mutationsResolverAttributes from './mutationsResolverAttributes';
import checkLockedData, { StandardMutationsArg, CommonResolverCreatorArg } from './checkLockedData';

const workOutMutations = async (
  standardMutationsArgs: StandardMutationsArg[],
  commonResolverCreatorArg: CommonResolverCreatorArg,
  preparedBulkData: PreparedData = { core: new Map(), periphery: new Map(), mains: [] },
): Promise<Array<any>> => {
  const { generalConfig, serversideConfig, context } = commonResolverCreatorArg;
  const { inventory } = generalConfig;
  const { transactions } = serversideConfig;
  const { mongooseConn } = context;

  if (!Array.isArray(standardMutationsArgs)) {
    throw new TypeError('Got standardMutationsArgs that is not array!');
  }

  let previouses: GraphqlObject[][] = [];

  const tryCount = 10;

  for (let j = 0; j < tryCount; j += 1) {
    let preparedData = preparedBulkData;

    const session = transactions ? await mongooseConn.startSession() : null;

    try {
      if (session) {
        await session.startTransaction();
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
          involvedFilters: involvedFiltersInArgs,
          lockedData,
        } = mutationArgs;

        const parent = parentInArgs || null;
        const info = infoInArgs || null;
        const involvedFilters = involvedFiltersInArgs || { inputOutputEntity: [[]] };

        const { getPrevious, prepareBulkData } = mutationsResolverAttributes[actionGeneralName];

        const { name } = entityConfig;

        if (lockedData) {
          await checkLockedData(mutationArgs, commonResolverCreatorArg);
        }

        const inventoryChain: InventoryChain = ['Mutation', actionGeneralName, name];
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
        } as const;

        const resolverArg = {
          parent,
          args,
          context,
          info,
          involvedFilters,
        } as const;

        const previous: GraphqlObject[] = await getPrevious(
          actionGeneralName,
          resolverCreatorArg,
          resolverArg,
          session,
        );

        if (!previous) {
          throw new TypeError(
            `Not got previous for "${actionGeneralName}" mutation for "${name}" entity!`,
          );
        }

        const { core, periphery } = preparedData;
        const preparedData2 = { core, periphery, mains: previous } as const;

        preparedData = await prepareBulkData(
          resolverCreatorArg,
          resolverArg,
          preparedData2,
          session,
        );
        if (!preparedData) {
          throw new TypeError(
            `Not got preparedData for "${actionGeneralName}" mutation for "${name}" entity!`,
          );
        }

        previouses.push(previous);
      }

      const { core, periphery } = preparedData;

      await unwindCore(core, mongooseConn, session);

      const coreWithPeriphery: Core =
        periphery && periphery.size
          ? await addPeripheryToCore(periphery, core, mongooseConn, session)
          : core;

      const optimizedCore = optimizeBulkItems(coreWithPeriphery);

      const coreWithCounters = await incCounters(optimizedCore, mongooseConn, session);

      await executeBulkItems(coreWithCounters, generalConfig, context, session);

      if (session) {
        await session.commitTransaction();
        await session.endSession();
      }

      break;
    } catch (err) {
      if (session) {
        await session.abortTransaction();
        await session.endSession();
      }

      if (j === tryCount - 1) {
        throw new Error(err);
      }

      await sleep(2 ** j);
    }
  }
  const finalResults: Array<any | null> = [];

  for (let i = 0; i < standardMutationsArgs.length; i += 1) {
    const mutationArgs = standardMutationsArgs[i];

    const {
      actionGeneralName,
      entityConfig,
      inAnyCase,
      parent: parentInArgs,
      args,
      info: infoInArgs,
      involvedFilters: involvedFiltersInArgs,
      returnReport,
      returnResult,
    } = mutationArgs;

    const parent = parentInArgs || null;
    const info = infoInArgs || null;
    const involvedFilters = involvedFiltersInArgs || { inputOutputEntity: [[]] };

    const { array, produceCurrent, report, finalResult } =
      mutationsResolverAttributes[actionGeneralName];

    const resolverCreatorArg = {
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    } as const;

    const resolverArg = {
      parent,
      args,
      context,
      info,
      involvedFilters,
    } as const;

    const previous = previouses[i];
    const result: null | { previous: GraphqlObject[]; current?: GraphqlObject[] } = returnResult
      ? ({} as { previous: GraphqlObject[]; current?: GraphqlObject[] })
      : null;

    if (result) {
      const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

      const asyncFuncResults = await getAsyncFuncResults(
        projection,
        resolverCreatorArg,
        resolverArg,
      );

      result.previous = previous.map((item, i) =>
        addCalculatedFieldsToEntity(
          addIdsToEntity(item, entityConfig),
          projection,
          asyncFuncResults,
          resolverArg,
          entityConfig as TangibleEntityConfig,
          i,
        ),
      );
    }

    if (result && produceCurrent) {
      const fakePreparedData: PreparedData = {
        core: new Map(),
        periphery: new Map(),
        mains: previous,
      };

      result.current = await produceResult(
        fakePreparedData,
        resolverCreatorArg,
        resolverArg,
        array,
      );
    }

    if (result && returnReport) {
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
