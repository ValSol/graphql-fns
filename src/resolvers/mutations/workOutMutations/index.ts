import type {
  GeneralConfig,
  GraphqlObject,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
  InvolvedFilter,
  SintheticResolverInfo,
  TangibleEntityConfig,
} from '../../../tsTypes';
import type { Core, PreparedData } from '../../tsTypes';

import addCalculatedFieldsToEntity from '../../utils/addCalculatedFieldsToEntity';
import addIdsToEntity from '../../utils/addIdsToEntity';
import checkInventory from '../../../utils/inventory/checkInventory';
import getProjectionFromInfo from '../../utils/getProjectionFromInfo';
import sleep from '../../../utils/sleep';
import incCounters from '../incCounters';
import addPeripheryToCore from '../addPeripheryToCore';
import executeBulkItems from '../executeBulkItems';
import optimizeBulkItems from '../optimizeBulkItems';
import produceResult from '../composeStandardMutationResolver/produceResult';
import unwindCore from '../unwindCore';
import mutationsResolverAttributes from './mutationsResolverAttributes';
import getAsyncFuncResults from '../../utils/getAsyncFuncResults';

type StandardMutationsArgs = Array<{
  actionGeneralName: string;
  entityConfig: EntityConfig;
  inAnyCase?: boolean;
  parent?: null | GraphqlObject;
  args: GraphqlObject;
  info?: SintheticResolverInfo;
  involvedFilters?: {
    inputOutputEntity: [InvolvedFilter[]] | [InvolvedFilter[], number];
  };
  returnReport?: boolean;
  returnResult: boolean;
}>;

type CommonResolverCreatorArg = {
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
  context: any;
};

const workOutMutations = async (
  standardMutationsArgs: StandardMutationsArgs,
  commonResolverCreatorArg: CommonResolverCreatorArg,
  preparedBulkData: PreparedData = { core: new Map(), periphery: new Map(), mains: [] },
): Promise<Array<any>> => {
  const { generalConfig, serversideConfig, context } = commonResolverCreatorArg;
  const { inventory } = generalConfig;
  const { transactions } = serversideConfig;
  const { mongooseConn } = context;

  let previouses: GraphqlObject[][] = [];

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
          involvedFilters: involvedFiltersInArgs,
        } = mutationArgs;

        const parent = parentInArgs || null;
        const info = infoInArgs || null;
        const involvedFilters = involvedFiltersInArgs || { inputOutputEntity: [[]] };

        const { getPrevious, prepareBulkData } = mutationsResolverAttributes[actionGeneralName];

        const { name } = entityConfig;

        const inventoryChain: InventoryСhain = ['Mutation', actionGeneralName, name];
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

        // eslint-disable-next-line no-await-in-loop
        const previous: GraphqlObject[] = await getPrevious(
          actionGeneralName,
          resolverCreatorArg,
          resolverArg,
        );

        if (!previous) {
          throw new TypeError(
            `Not got preivous for "${actionGeneralName}" mutation for "${name}" entity!`,
          );
        }

        const { core, periphery } = preparedData;
        const preparedData2 = { core, periphery, mains: previous } as const;
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

      await unwindCore(core, mongooseConn);

      const coreWithPeriphery: Core =
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
        resolverArg,
        entityConfig as TangibleEntityConfig,
      );

      result.previous = previous.map((item) =>
        addCalculatedFieldsToEntity(
          addIdsToEntity(item, entityConfig),
          projection,
          asyncFuncResults,
          resolverArg,
          entityConfig as TangibleEntityConfig,
        ),
      );
    }

    if (result && produceCurrent) {
      const fakePreparedData: PreparedData = {
        core: new Map(),
        periphery: new Map(),
        mains: previous,
      };
      // eslint-disable-next-line no-await-in-loop
      result.current = await produceResult(
        fakePreparedData,
        entityConfig,
        generalConfig,
        resolverArg,
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
