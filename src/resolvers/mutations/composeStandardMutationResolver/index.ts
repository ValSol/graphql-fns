import type {
  Context,
  GeneralConfig,
  GraphqlObject,
  InventoryChain,
  ServersideConfig,
  EntityConfig,
  InvolvedFilter,
  SintheticResolverInfo,
  GraphqlScalar,
  TangibleEntityConfig,
  ResolverArg,
} from '@/tsTypes';
import type { PreparedData, ResolverAttributes } from '@/resolvers/tsTypes';

import checkInventory from '@/utils/inventory/checkInventory';
import { syncAllMongooseModels } from '@/mongooseModels/initMongooseModels';
import { checkPubsub } from '@/utils/composeReport';
import sleep from '@/utils/sleep';
import addCalculatedFieldsToEntity from '@/resolvers/utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '@/resolvers/utils/addIdsToEntity';
import getAsyncFuncResults from '@/resolvers/utils/getAsyncFuncResults';
import getCalculatedFieldsConfig from '@/resolvers/utils/getCalculatedFieldsConfig';
import removeCalculatedFieldValues from '@/resolvers/utils/removeCalculatedFieldValues';
import getInfoEssence from '@/resolvers/utils/getInfoEssence';
import incCounters from '../incCounters';
import normalizeWhereCompoundOne from '../normalizeWhereCompoundOne';
import addPeripheryToCore from '../addPeripheryToCore';
import executeBulkItems from '../executeBulkItems';
import optimizeBulkItems from '../optimizeBulkItems';
import unwindCore from '../unwindCore';
import commitTransactionWithRetry from '../workOutMutations/commitTransactionWithRetry';
import isTransientTransactionError from '../workOutMutations/isTransientTransactionError';
import produceResult from './produceResult';

type Args = {
  data: any;
  token?: string;
};

type Result = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
) => any | null;

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
  ): any | null => {
    const { inventory } = generalConfig;
    const { transactions } = serversideConfig;
    const { name } = entityConfig;

    const inventoryChain: InventoryChain = ['Mutation', actionGeneralName, name];
    if (!inAnyCase && !checkInventory(inventoryChain, inventory)) {
      return null;
    }

    const resolver = async (
      parent: null | GraphqlObject,
      args: Args,
      context: Context,
      info: SintheticResolverInfo,
      resolverOptions: {
        involvedFilters: {
          [representationConfigName: string]:
            null | [InvolvedFilter[]] | [InvolvedFilter[], number];
        };
      },
    ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
      const resolverCreatorArg = {
        entityConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      } as const;

      const resolverArg0 = { parent, args, context, info, resolverOptions } as const;
      const { mongooseConn } = context;

      // "whereCompoundOne" is replaced by "whereOne" inside every try (in the same session as writes)
      let resolverArg = resolverArg0;

      if (loophole) {
        return loophole(actionGeneralName, resolverCreatorArg, resolverArg);
      }

      const result = {} as { previous: GraphqlObject[]; current: GraphqlObject[] };

      const tryCount = 7;

      let preparedData: PreparedData = {
        core: new Map(),
        periphery: new Map(),
        mains: [],
      };

      const infoEssence = getInfoEssence(entityConfig as TangibleEntityConfig, info);

      if (!report) {
        throw new TypeError(`report have to be setted for "${actionGeneralName}"`);
      }

      const subscription = await report(resolverCreatorArg, resolverArg);

      if (subscription) {
        checkPubsub(context);
      }

      // calculated fields of "previous" entities are used only if they are returned (delete…) or reported
      const previousIsUsed = !produceCurrent || Boolean(subscription);

      // collections and indexes can't be created within a transaction: all models are synced before
      if (transactions) {
        await syncAllMongooseModels(mongooseConn, generalConfig);
      }

      for (let i = 0; i < tryCount; i += 1) {
        const session = transactions ? await mongooseConn.startSession() : null;

        const preCommitResult = { current: false }; // to select errors on session.commitTransaction from others

        try {
          if (session) {
            await session.startTransaction();
          }

          resolverArg = {
            ...resolverArg0,
            args: (await normalizeWhereCompoundOne(
              actionGeneralName,
              args,
              entityConfig,
              generalConfig,
              mongooseConn,
              session,
            )) as Args,
          };

          if (!getPrevious) {
            throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
          }

          const prePrevious = await getPrevious(
            actionGeneralName,
            resolverCreatorArg,
            resolverArg,
            session,
          );

          // "getPrevious" returns a falsy value if the mutation is not allowed
          const previous =
            prePrevious &&
            prePrevious.map((item) =>
              removeCalculatedFieldValues(
                item,
                getCalculatedFieldsConfig(resolverCreatorArg, resolverArg),
              ),
            );

          if (!previous) {
            if (session) {
              await session.abortTransaction();
              await session.endSession();
            }
            return null;
          }

          // compose "argsForAsyncFunc" to prevent leak of MUTATION args instead of "where" or "whereOne"("whereCompoundOne")
          const { argsForAsyncFunc, notAsyncCalculatedFieldValues } =
            previous.length === 0 || !previousIsUsed
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

          result.previous = previousIsUsed
            ? previous.map((item, i) =>
                addCalculatedFieldsToEntity(
                  addIdsToEntity(item, entityConfig),
                  infoEssence,
                  asyncFuncResults,
                  resolverArg,
                  resolverCreatorArg,
                  i,
                ),
              )
            : previous.map((item) => addIdsToEntity(item, entityConfig));

          if (!prepareBulkData) {
            throw new TypeError(`prepareBulkData have to be setted for "${actionGeneralName}"`);
          }

          const prevPreparedData: PreparedData = {
            core: new Map(),
            periphery: new Map(),
            mains: previous,
          };

          preparedData = await prepareBulkData(
            resolverCreatorArg,
            resolverArg,
            prevPreparedData,
            session,
          );

          if (!preparedData) {
            if (session) {
              await session.abortTransaction();
              await session.endSession();
            }
            return null;
          }

          const { core, periphery } = preparedData;

          await unwindCore(core, mongooseConn, session);

          const coreWithPeriphery =
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

      if (produceCurrent) {
        result.current = await produceResult(preparedData, resolverCreatorArg, resolverArg, array);
      }

      if (subscription) {
        subscription(result);
      }

      if (!finalResult) {
        throw new TypeError(`finalResult have to be setted for "${actionGeneralName}"`);
      }

      return finalResult(result);
    };

    return resolver;
  };

  return createMutationResolver;
};

export default composeStandardMutationResolver;
