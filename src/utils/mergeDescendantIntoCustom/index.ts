import type { Custom, GeneralConfig } from '../../tsTypes';

import parseEntityName from '../parseEntityName';
import composeCustomAction from './composeCustomAction';
import getTangibleEntities from './getTangibleEntities';

import { mutationAttributes, queryAttributes } from '../../types/actionAttributes';

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

const store = Object.create(null);

const mergeDescendantIntoCustom = (
  generalConfig: GeneralConfig,
  variant: 'forClient' | 'forCustomResolver' | 'forGqlResolvers' = 'forGqlResolvers',
): null | Custom => {
  // use cache if no jest test environment
  if (!process.env.JEST_WORKER_ID && store[variant]) return store[variant];

  const { allEntityConfigs, custom, descendant } = generalConfig;

  // *** test correctness

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

                if (!prev.includes(entityName)) {
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

  if (!descendant) {
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

  const Query = Object.keys(descendant).reduce<Record<string, any>>((prev, descendantKey) => {
    const { allow } = descendant[descendantKey];
    const allowedMethods = getAllowedMethods(allow);

    Object.keys(queryAttributes).forEach((actionName) => {
      if (
        (!forClientActions.includes(actionName) || variant !== 'forClient') &&
        allowedMethods[actionName] &&
        (variant === 'forCustomResolver' || !queryAttributes[actionName].actionIsChild)
      ) {
        prev[queryAttributes[actionName].actionGeneralName(descendantKey)] = composeCustomAction(
          descendant[descendantKey],
          queryAttributes[actionName],
        );
      }
    });

    return prev;
  }, {});

  const Mutation = Object.keys(descendant).reduce<Record<string, any>>((prev, descendantKey) => {
    const { allow } = descendant[descendantKey];
    const allowedMethods = getAllowedMethods(allow);

    Object.keys(mutationAttributes).forEach((actionName) => {
      if (allowedMethods[actionName]) {
        prev[mutationAttributes[actionName].actionGeneralName(descendantKey)] = composeCustomAction(
          descendant[descendantKey],
          mutationAttributes[actionName],
        );
      }
    });

    return prev;
  }, {});

  if (!custom) {
    store[variant] = { Query, Mutation };
  } else {
    store[variant] = {
      ...custom,
      Query: { ...Query, ...custom.Query },
      Mutation: { ...Mutation, ...custom.Mutation },
    };
  }

  return store[variant];
};

export default mergeDescendantIntoCustom;
