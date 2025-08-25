import deepEqual from 'fast-deep-equal';
import pluralize from 'pluralize';

import type {
  GeneralConfig,
  GraphqlObject,
  ServersideConfig,
  EntityConfig,
  InvolvedFilter,
  SintheticResolverInfo,
} from '@/tsTypes';

import composeQueryResolver from '@/resolvers/utils/composeQueryResolver';
import createInfoEssence from '@/resolvers/utils/createInfoEssence';

type ResultObject = Record<string, any>;

export type StandardMutationsArg = {
  actionGeneralName: string;
  entityConfig: EntityConfig;
  inAnyCase?: boolean;
  parent?: null | GraphqlObject;
  args: GraphqlObject;
  info?: SintheticResolverInfo;
  resolverOptions?: {
    involvedFilters: {
      inputOutputEntity: [InvolvedFilter[]] | [InvolvedFilter[], number];
    };
  };
  returnReport?: boolean;
  returnResult: boolean;
  lockedData?: { args: GraphqlObject; result: null | ResultObject | ResultObject[] };
};

export type CommonResolverCreatorArg = {
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
  context: any;
};

const checkObject = (resultItem: ResultObject, currentResultItem: ResultObject) =>
  Object.keys(resultItem).forEach((key) => {
    if (resultItem[key] === null) {
      if (!(currentResultItem[key] === null || currentResultItem[key] === undefined)) {
        throw new TypeError(
          `Got current result.${key} = "${currentResultItem[key]}", but have to be "${resultItem[key]}"!`,
        );
      }
    } else if (typeof resultItem[key] === 'object') {
      if (!deepEqual(currentResultItem[key], resultItem[key])) {
        throw new TypeError(
          `Got current result.${key} = "${currentResultItem[key]}", but have to be "${resultItem[key]}"!`,
        );
      }
    } else if (typeof resultItem[key] === 'string') {
      if (currentResultItem[key].toString() !== resultItem[key]) {
        throw new TypeError(
          `Got current result.${key} = "${currentResultItem[key]}", but have to be "${resultItem[key]}"!`,
        );
      }
    } else {
      if (currentResultItem[key] !== resultItem[key]) {
        throw new TypeError(
          `Got current result.${key} = "${currentResultItem[key]}", but have to be "${resultItem[key]}"!`,
        );
      }
    }
  });

const checkLockedData = async (
  mutationArgs: StandardMutationsArg,
  commonResolverCreatorArg: CommonResolverCreatorArg,
  session: any,
) => {
  const { generalConfig, serversideConfig, context } = commonResolverCreatorArg;
  const { entityConfig, lockedData } = mutationArgs;

  if (!lockedData) {
    throw new TypeError(`Got undefined "lockedData"!`);
  }

  const { args, result } = lockedData;

  const { name: entityName } = entityConfig;

  if (result && Array.isArray(result)) {
    const projection = result.reduce(
      (prev, resultItem) => {
        Object.keys(resultItem).forEach((key) => {
          prev[key] = 1;
        });

        return prev;
      },
      {} as Record<string, 1>,
    );

    const projection2 = Object.keys(result).reduce(
      (prev, key) => {
        prev[key] = 1;

        return prev;
      },
      {} as Record<string, 1>,
    );

    const pluralizedEntityName = pluralize(entityName);

    const currentResult = await composeQueryResolver(
      pluralizedEntityName,
      generalConfig,
      serversideConfig,
    )(null, args, context, createInfoEssence(projection), {
      involvedFilters: { inputOutputEntity: [[]] },
    });

    if (result.length !== currentResult.length) {
      throw new TypeError(
        `Got current result = ${JSON.stringify(currentResult)}, but have to be ${JSON.stringify(result)}!`,
      );
    }

    result.forEach((resultItem, i) => {
      const currentResultItem = currentResult[i];

      checkObject(resultItem, currentResultItem);
    });
  } else {
    const projection = result
      ? Object.keys(result).reduce(
          (prev, key) => {
            prev[key] = 1;

            return prev;
          },
          {} as Record<string, 1>,
        )
      : ({ _id: 1 } as Record<string, 1>);

    const currentResult = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
      null,
      args,
      context,
      createInfoEssence(projection),
      { involvedFilters: { inputOutputEntity: [[]] } },
      session,
    );

    if ((!currentResult && result) || (currentResult && !result)) {
      throw new TypeError(
        `Got current result = ${JSON.stringify(currentResult)}, but have to be ${JSON.stringify(result)}!`,
      );
    }

    if (currentResult !== result) {
      // currentResult === result MAY ONLY BE If result === null
      checkObject(result, currentResult);
    }
  }
};

export default checkLockedData;
