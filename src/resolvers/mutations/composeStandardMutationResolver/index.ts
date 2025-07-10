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
} from '../../../tsTypes';
import type { PreparedData, ResolverAttributes } from '../../tsTypes';

import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import checkInventory from '../../../utils/inventory/checkInventory';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import sleep from '../../../utils/sleep';
import incCounters from '../incCounters';
import addPeripheryToCore from '../addPeripheryToCore';
import executeBulkItems from '../executeBulkItems';
import optimizeBulkItems from '../optimizeBulkItems';
import unwindCore from '../unwindCore';
import produceResult from './produceResult';
import getAsyncFuncResults from '../../utils/getAsyncFuncResults';

type Args = {
  data: any;
  positions: {
    [key: string]: Array<number>;
  };
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
      involvedFilters: {
        [descendantConfigName: string]: null | [InvolvedFilter[]] | [InvolvedFilter[], number];
      },
    ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
      const resolverCreatorArg = {
        entityConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      } as const;

      const resolverArg = { parent, args, context, info, involvedFilters } as const;
      const { mongooseConn } = context;

      if (loophole) {
        return loophole(actionGeneralName, resolverCreatorArg, resolverArg);
      }

      const result = {} as { previous: GraphqlObject[]; current: GraphqlObject[] };

      const tryCount = 10;

      let preparedData: PreparedData = {
        core: new Map(),
        periphery: new Map(),
        mains: [],
      };

      const projection = getProjectionFromInfo(entityConfig as TangibleEntityConfig, resolverArg);

      const asyncFuncResults = await getAsyncFuncResults(
        projection,
        resolverCreatorArg,
        resolverArg,
      );

      for (let i = 0; i < tryCount; i += 1) {
        const session = transactions ? await mongooseConn.startSession() : null;

        try {
          if (session) {
            await session.startTransaction();
          }

          if (!getPrevious) {
            throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
          }

          const previous = await getPrevious(actionGeneralName, resolverCreatorArg, resolverArg);

          if (!previous) {
            if (session) {
              await session.abortTransaction();
              await session.endSession();
            }
            return null;
          }

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

          if (!prepareBulkData) {
            throw new TypeError(`getPrevious have to be setted for "${actionGeneralName}"`);
          }

          const prevPreparedData: PreparedData = {
            core: new Map(),
            periphery: new Map(),
            mains: previous,
          };

          preparedData = await prepareBulkData(resolverCreatorArg, resolverArg, prevPreparedData);

          if (!preparedData) {
            if (session) {
              await session.abortTransaction();
              await session.endSession();
            }
            return null;
          }

          const { core, periphery } = preparedData;

          await unwindCore(core, mongooseConn);

          const coreWithPeriphery =
            periphery && periphery.size
              ? await addPeripheryToCore(periphery, core, mongooseConn)
              : core;

          const optimizedCore = optimizeBulkItems(coreWithPeriphery);

          const coreWithCounters = await incCounters(optimizedCore, mongooseConn);

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

          if (i === tryCount - 1) {
            throw new Error(err);
          }

          await sleep(2 ** i);
        }
        // finally {
        //   if (session) {
        //     await session.endSession(); // 💥 essential!
        //   }
        // }
      }

      if (produceCurrent) {
        result.current = await produceResult(preparedData, resolverCreatorArg, resolverArg, array);
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
