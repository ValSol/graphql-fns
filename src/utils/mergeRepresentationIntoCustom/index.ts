import type { Custom, GeneralConfig } from '@/tsTypes';
import {
  mutationAttributes,
  queryAttributes,
  subscriptionAttributes,
} from '@/types/actionAttributes';

import parseEntityName from '../parseEntityName';
import composeCustomAction from './composeCustomAction';
import getTangibleEntities from './getTangibleEntities';
import createObjectBoundStore from '@/utils/createObjectBoundStore';

const regExp = /[\[\]\!]/g;

const scalarTypes = [
  'Boolean',
  'DateTime',
  // 'GeospatialPoint',
  // 'GeospatialPolygon',
  // 'GeospatialPolygonRing',
  'ID',
  'Int',
  'Float',
  'String',
  'Upload',
];

const forClientActions = ['childEntity', 'childEntities'];

// separate cache for every generalConfig
const getStore = createObjectBoundStore();

const mergeRepresentationIntoCustom = (
  generalConfig: GeneralConfig,
  variant: 'forClient' | 'forCustomResolver' | 'forGqlResolvers' = 'forGqlResolvers',
): null | Custom => {
  const store = getStore(generalConfig);

  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[variant]) return store[variant];

  const { allEntityConfigs, custom, representations } = generalConfig;

  // *** test correctness

  // only standard & representation subscriptions are supported
  if ((custom as Custom | undefined)?.Subscription !== undefined) {
    throw new TypeError(
      'Custom subscriptions are not supported: remove "Subscription" from "custom" of generalConfig!',
    );
  }

  if (custom) {
    const { Query = {}, Mutation = {} } = custom;

    const action = { ...Query, ...Mutation } as const;
    Object.keys(action).forEach((name) => {
      const actionSignature = action[name];

      Object.keys(allEntityConfigs).forEach((entityName) => {
        const entityConfig = allEntityConfigs[entityName];

        const customActionName = actionSignature.specificName(entityConfig, generalConfig);

        if (!customActionName) return;

        const involvedEntityNames = actionSignature.involvedEntityNames(
          entityConfig,
          generalConfig,
        );

        const inputEntityName =
          involvedEntityNames.inputOutputEntity || involvedEntityNames.inputEntity;

        const { root: inputEntityRootName } = parseEntityName(inputEntityName, generalConfig);

        if (inputEntityRootName !== entityConfig.name) {
          throw new TypeError(
            `Intput involved entity: "${inputEntityRootName}" not correspnding to "${entityConfig.name}" base config in custom action "${customActionName}"!`,
          );
        }

        const rawCustomType = actionSignature.type(entityConfig, generalConfig);

        const customType = rawCustomType.replace(regExp, '');

        const customConfig = actionSignature.config(entityConfig, generalConfig);

        if (!customConfig) {
          if (!scalarTypes.includes(customType)) {
            throw new TypeError(
              `Custom action type: "${rawCustomType}" not correspnding to "null" config in custom action "${customActionName}"!`,
            );
          }

          return;
        }

        if (customType !== customConfig.name) {
          throw new TypeError(
            `Custom action type: "${rawCustomType}" not correspnding to "${customConfig.name}" config in custom action "${customActionName}"!`,
          );
        }

        const outputEntityName =
          involvedEntityNames.inputOutputEntity || involvedEntityNames.outputEntity;

        if (outputEntityName !== customConfig.name && customConfig.type === 'tangible') {
          throw new TypeError(
            `Output involved entity: "${outputEntityName}" not correspnding to "${customConfig.name}" config in custom action "${customActionName}"!`,
          );
        }

        if (customConfig.type === 'virtual') {
          const involvedOutputEntityNames = Object.keys(involvedEntityNames).reduce<Array<any>>(
            (prev, involvedEntityKey) => {
              if (
                involvedEntityKey === 'inputOutputEntity' ||
                involvedEntityKey.startsWith('output')
              ) {
                const entityName2 = involvedEntityNames[involvedEntityKey];

                if (!prev.includes(entityName2)) {
                  prev.push(entityName2);
                }
              }

              return prev;
            },
            [],
          );

          const tangibleEntities = getTangibleEntities(customConfig);

          tangibleEntities.forEach((tangibleEntity) => {
            if (!involvedOutputEntityNames.includes(tangibleEntity)) {
              throw new TypeError(
                `Child tangible entity: "${tangibleEntity}" of custom config "${customConfig.name}" not found in "involvedEntityNames"!`,
              );
            }
          });
        }
      });
    });
  }

  // ***

  if (!representations) {
    store[variant] = custom || null;
    return store[variant];
  }

  const getAllowedMethods = (allow) =>
    Object.keys(allow).reduce<Record<string, any>>((prev, entityName) => {
      allow[entityName].forEach((methodName) => {
        prev[methodName] = true;
      });
      return prev;
    }, {});

  const Query = Object.keys(representations).reduce<Record<string, any>>(
    (prev, representationKey) => {
      const { allow } = representations[representationKey];
      const allowedMethods = getAllowedMethods(allow);

      Object.keys(queryAttributes).forEach((actionName) => {
        if (
          (!forClientActions.includes(actionName) || variant !== 'forClient') &&
          allowedMethods[actionName] &&
          (variant === 'forCustomResolver' || !queryAttributes[actionName].actionIsChild)
        ) {
          prev[queryAttributes[actionName].actionGeneralName(representationKey)] =
            composeCustomAction(representations[representationKey], queryAttributes[actionName]);
        }
      });

      return prev;
    },
    {},
  );

  const Mutation = Object.keys(representations).reduce<Record<string, any>>(
    (prev, representationKey) => {
      const { allow } = representations[representationKey];
      const allowedMethods = getAllowedMethods(allow);

      Object.keys(mutationAttributes).forEach((actionName) => {
        if (allowedMethods[actionName]) {
          prev[mutationAttributes[actionName].actionGeneralName(representationKey)] =
            composeCustomAction(representations[representationKey], mutationAttributes[actionName]);
        }
      });

      return prev;
    },
    {},
  );

  const Subscription = Object.keys(representations).reduce<Record<string, any>>(
    (prev, representationKey) => {
      const { allow } = representations[representationKey];
      const allowedMethods = getAllowedMethods(allow);

      Object.keys(subscriptionAttributes).forEach((actionName) => {
        if (allowedMethods[actionName]) {
          prev[subscriptionAttributes[actionName].actionGeneralName(representationKey)] =
            composeCustomAction(
              representations[representationKey],
              subscriptionAttributes[actionName],
            );
        }
      });

      return prev;
    },
    {},
  );

  if (!custom) {
    store[variant] = { Query, Mutation, Subscription };
  } else {
    store[variant] = {
      ...custom,
      Query: { ...Query, ...custom.Query },
      Mutation: { ...Mutation, ...custom.Mutation },
      Subscription, // only representation subscriptions (custom subscriptions are forbidden above)
    };
  }

  return store[variant];
};

export default mergeRepresentationIntoCustom;
