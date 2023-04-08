import type { DerivativeAttributesActionName, GeneralConfig } from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import actionAttributes from '../../types/actionAttributes';

const toOtherType = {
  Query: 'Mutation',
  Mutation: 'Query',
} as const;

const prohibitedForRootActions = ['childEntity', 'childEntities'];

const parseAction = (
  { actionType, actionName, entityName, derivativeKey }: ActionToParse,
  generalConfig: GeneralConfig,
): ParsedAction => {
  const { allEntityConfigs, custom, derivative } = generalConfig;

  if (!allEntityConfigs[entityName]) {
    throw new TypeError(`Not found entity with name: "${entityName}"!`);
  }

  if (prohibitedForRootActions.includes(actionName)) {
    throw new TypeError(`Query "${actionName}" prohibited for root execution!`);
  }

  if (actionAttributes[actionName]) {
    const attributes = actionAttributes[actionName];

    if (attributes.actionType !== actionType) {
      throw new TypeError(
        `Standard ${attributes.actionType} "${actionName}" declared as "${actionType}"!`,
      );
    }

    if (!derivativeKey) {
      throw new TypeError(
        `Not setted derivativeKey for action "${actionName}" & entity: "${entityName}"!`,
      );
    }

    const entityConfig = attributes.actionReturnConfig(allEntityConfigs[entityName], generalConfig);

    return {
      creationType: 'standard',
      entityConfig,
      baseAction: '',
      derivativeKey,
    };
  }

  if (custom) {
    if (custom[actionType] && custom[actionType][actionName]) {
      const signatureMethods = custom[actionType][actionName];

      const entityConfig = signatureMethods.config(allEntityConfigs[entityName], generalConfig);

      let calculatedDerivativeKey = '';

      if (entityConfig && derivative && !allEntityConfigs[entityConfig.name]) {
        const { name } = entityConfig;
        const derivativeKeys = Object.keys(derivative);

        for (let i = 0; i < derivativeKeys.length; i += 1) {
          const currentDerivativeKey = derivativeKeys[i];
          if (name.endsWith(currentDerivativeKey)) {
            const baseName = name.slice(0, -currentDerivativeKey.length);
            if (allEntityConfigs[baseName]) {
              calculatedDerivativeKey = currentDerivativeKey;
              break;
            }
          }
        }
      }

      if (calculatedDerivativeKey && derivativeKey && calculatedDerivativeKey !== derivativeKey) {
        throw new TypeError(
          `Setted derivativeKey: "${derivativeKey}" not equal to calculated derivativeKey "${calculatedDerivativeKey}" for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      if (!calculatedDerivativeKey && !derivativeKey) {
        throw new TypeError(
          `Not setted derivativeKey for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      return {
        creationType: 'custom',
        entityConfig,
        baseAction: '',
        derivativeKey: calculatedDerivativeKey || derivativeKey || '', // last || '' added to prevent flowjs error
      };
    }

    if (custom[toOtherType[actionType]] && custom[toOtherType[actionType]][actionName]) {
      throw new TypeError(
        `Custom ${toOtherType[actionType]} "${actionName}" declared as "${actionType}"!`,
      );
    }
  }

  if (derivative) {
    const derivativeKeys = Object.keys(derivative);

    for (let i = 0; i < derivativeKeys.length; i += 1) {
      const currentDerivativeKey = derivativeKeys[i];

      if (actionName.endsWith(currentDerivativeKey)) {
        const baseAction = actionName.slice(0, -currentDerivativeKey.length);

        if (actionAttributes[baseAction]) {
          if (prohibitedForRootActions.includes(baseAction)) {
            throw new TypeError(`Query "${actionName}" prohibited for root execution!`);
          }

          const {
            allow: { [entityName]: actions },
          } = derivative[currentDerivativeKey];

          if (!actions) {
            throw new TypeError(
              `For action "${actionName}" not allowed entity: "${entityName}" with derfivative derivativeKey: "${currentDerivativeKey}"!`,
            );
          }

          if (!actions.includes(baseAction as DerivativeAttributesActionName)) {
            throw new TypeError(
              `For action "${actionName}" not found baseAction: "${baseAction}" with derfivative derivativeKey: "${currentDerivativeKey}" & entity: ${entityName}!`,
            );
          }

          const entityConfig = actionAttributes[baseAction].actionReturnConfig(
            allEntityConfigs[entityName],
            generalConfig,
            currentDerivativeKey,
          );

          if (derivativeKey) {
            throw new TypeError(
              `Need not set derivativeKey: "${derivativeKey}" for action "${actionName}" & entity: "${entityName}"!`,
            );
          }

          return {
            creationType: 'derivative',
            entityConfig,
            baseAction,
            derivativeKey: currentDerivativeKey,
          };
        }
      }
    }
  }

  throw new TypeError(`Got not used actionName: "${actionName}"!`);
};

export default parseAction;
