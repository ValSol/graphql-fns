import type {
  GraphqlObject,
  InventoryChain,
  ResolverArg,
  ResolverCreatorArg,
  TangibleEntityConfig,
} from '@/tsTypes';
import type { Core, PreparedData } from '@/resolvers/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import sleep from '@/utils/sleep';
import addCalculatedFieldsToEntity from '@/resolvers/utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '@/resolvers/utils/addIdsToEntity';
import getAsyncFuncResults from '@/resolvers/utils/getAsyncFuncResults';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
import removeCalculatedFieldValues from '@/resolvers/utils/removeCalculatedFieldValues';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import addPeripheryToCore from '../addPeripheryToCore';
import produceResult from '../composeStandardMutationResolver/produceResult';
import executeBulkItems from '../executeBulkItems';
import incCounters from '../incCounters';
import optimizeBulkItems from '../optimizeBulkItems';
import unwindCore from '../unwindCore';
import mutationsResolverAttributes from './mutationsResolverAttributes';
import checkLockedData, { StandardMutationsArg, CommonResolverCreatorArg } from './checkLockedData';
import commitTransactionWithRetry from './commitTransactionWithRetry';
import copyPreparedData from './copyPreparedData';
import isTransientTransactionError from './isTransientTransactionError';

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

  const tryCount = 7;

  const initialPreparedData = copyPreparedData(preparedBulkData);

  for (let i = 0; i < tryCount; i += 1) {
    let preparedData = copyPreparedData(initialPreparedData);

    const session = transactions ? await mongooseConn.startSession() : null;

    const preCommitResult = { current: false }; // to select errors on session.commitTransaction from others

    try {
      if (session) {
        await session.startTransaction();
      }

      previouses = [];
      for (let j = 0; j < standardMutationsArgs.length; j += 1) {
        const mutationArgs = standardMutationsArgs[j];

        const {
          actionGeneralName,
          entityConfig,
          inAnyCase,
          parent: parentInArgs,
          args,
          info: infoInArgs,
          resolverOptions: resolverOptionsInArgs,
          lockedData,
        } = mutationArgs;

        const parent = parentInArgs || null;
        const info = infoInArgs || null;
        const resolverOptions = resolverOptionsInArgs || {
          involvedFilters: { inputOutputFilterAndLimit: [[]] },
        };

        const { array, getPrevious, prepareBulkData } =
          mutationsResolverAttributes[actionGeneralName];

        const { name } = entityConfig;

        if (lockedData) {
          await checkLockedData(mutationArgs, commonResolverCreatorArg, session);
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
          resolverOptions,
        } as const;

        const prePrevious = await getPrevious(
          actionGeneralName,
          resolverCreatorArg,
          resolverArg,
          session,
        );

        // "getPrevious" returns a falsy value if the mutation is not allowed
        const previous: GraphqlObject[] =
          prePrevious &&
          prePrevious.map((item) =>
            removeCalculatedFieldValues(
              item,
              getCalculatedFieldsConfig(resolverCreatorArg, resolverArg),
            ),
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

      preCommitResult.current = true;

      if (session) {
        await commitTransactionWithRetry(session, tryCount);
        await session.endSession();
      }

      break;
    } catch (err) {
      if (session) {
        if (preCommitResult.current === false) {
          await session.abortTransaction();
        }
        await session.endSession();
      }

      // retry only transaction errors that mongodb marks as transient, all other errors are
      // thrown as is; without transaction nothing is retried to not repeat partially done writes
      if (!session || i === tryCount - 1 || !isTransientTransactionError(err)) {
        throw err;
      }

      await sleep(100 * 2 ** i);
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
      resolverOptions: resolverOptionsInArgs,
      returnReport,
      returnResult,
    } = mutationArgs;

    const parent = parentInArgs || null;
    const info = infoInArgs || null;
    const resolverOptions = resolverOptionsInArgs || {
      involvedFilters: { inputOutputFilterAndLimit: [[]] },
    };

    const { array, produceCurrent, report, finalResult } =
      mutationsResolverAttributes[actionGeneralName];

    const resolverCreatorArg = {
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    } as ResolverCreatorArg;

    const resolverArg = {
      parent,
      args,
      context,
      info,
      resolverOptions,
    } as ResolverArg;

    const previous = previouses[i];
    const result: null | { previous: GraphqlObject[]; current?: GraphqlObject[] } = returnResult
      ? ({} as { previous: GraphqlObject[]; current?: GraphqlObject[] })
      : null;

    const subscription =
      result && returnReport ? await report(resolverCreatorArg, resolverArg) : null;

    // calculated fields of "previous" entities are used only if they are returned (delete…) or reported
    const previousIsUsed = !produceCurrent || Boolean(subscription);

    if (result && !previousIsUsed) {
      result.previous = previous.map((item) => addIdsToEntity(item, entityConfig));
    }

    if (result && previousIsUsed) {
      const infoEssence = getInfoEssence(entityConfig as TangibleEntityConfig, info);

      // compose "argsForAsyncFunc" to prevent leak of MUTATION args instead of "where" or "whereOne"("whereCompoundOne")
      const { argsForAsyncFunc, notAsyncCalculatedFieldValues } =
        previous.length === 0
          ? { argsForAsyncFunc: null }
          : array
            ? {
                argsForAsyncFunc: {
                  where: { id_in: previous.map(({ _id }) => _id) },
                  token: resolverArg.args.token,
                },

                notAsyncCalculatedFieldValues: previous,
              }
            : {
                argsForAsyncFunc: {
                  whereOne: { id: previous[0]._id },
                  token: resolverArg.args.token,
                },

                notAsyncCalculatedFieldValues: previous[0],
              };

      const asyncFuncResults = argsForAsyncFunc
        ? await getAsyncFuncResults(
            infoEssence,
            resolverCreatorArg,
            {
              ...resolverArg,
              args: argsForAsyncFunc,
            } as ResolverArg,
            notAsyncCalculatedFieldValues,
          )
        : {};

      result.previous = previous.map((item, i) =>
        addCalculatedFieldsToEntity(
          addIdsToEntity(item, entityConfig),
          infoEssence,
          asyncFuncResults,
          resolverArg,
          resolverCreatorArg,
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

    if (result && subscription) {
      subscription(result);
    }

    finalResults.push(result && finalResult(result));
  }

  return finalResults;
};

export default workOutMutations;
