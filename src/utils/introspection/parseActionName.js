// @flow

import type { GeneralConfig } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

import actionAttributes from '../../types/actionAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const toOtherType = {
  Query: 'Mutation',
  Mutation: 'Query',
};

const prohibitedForRootActions = ['childEntity', 'childEntities'];

const parseAction = (
  { actionType, actionName, entityName, suffix }: ActionToParse,
  generalConfig: GeneralConfig,
): ParsedAction => {
  const { entityConfigs, custom, derivative } = generalConfig;

  if (!entityConfigs[entityName]) {
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

    if (!suffix) {
      throw new TypeError(
        `Not setted suffix for action "${actionName}" & entity: "${entityName}"!`,
      );
    }

    const entityConfig = attributes.actionReturnConfig ? entityConfigs[entityName] : null;

    return {
      creationType: 'standard',
      entityConfig,
      baseAction: '',
      suffix,
    };
  }

  if (custom) {
    if (custom[actionType] && custom[actionType][actionName]) {
      const signatureMethods = custom[actionType][actionName];

      const entityConfig = signatureMethods.config(entityConfigs[entityName], generalConfig);

      let calculatedSuffix = '';

      if (entityConfig && derivative && !entityConfigs[entityConfig.name]) {
        const { name } = entityConfig;
        const suffixes = Object.keys(derivative);

        for (let i = 0; i < suffixes.length; i += 1) {
          const currentSuffix = suffixes[i];
          if (name.endsWith(currentSuffix)) {
            const baseName = name.slice(0, -currentSuffix.length);
            if (entityConfigs[baseName]) {
              calculatedSuffix = currentSuffix;
              break;
            }
          }
        }
      }

      if (calculatedSuffix && suffix && calculatedSuffix !== suffix) {
        throw new TypeError(
          `Setted suffix: "${suffix}" not equal to calculated suffix "${calculatedSuffix}" for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      if (!calculatedSuffix && !suffix) {
        throw new TypeError(
          `Not setted suffix for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      return {
        creationType: 'custom',
        entityConfig,
        baseAction: '',
        suffix: calculatedSuffix || suffix || '', // last || '' added to prevent flowjs error
      };
    }

    if (custom[toOtherType[actionType]] && custom[toOtherType[actionType]][actionName]) {
      throw new TypeError(
        `Custom ${toOtherType[actionType]} "${actionName}" declared as "${actionType}"!`,
      );
    }
  }

  if (derivative) {
    const suffixes = Object.keys(derivative);

    for (let i = 0; i < suffixes.length; i += 1) {
      const currentSuffix = suffixes[i];

      if (actionName.endsWith(currentSuffix)) {
        const baseAction = actionName.slice(0, -currentSuffix.length);

        if (actionAttributes[baseAction]) {
          if (prohibitedForRootActions.includes(baseAction)) {
            throw new TypeError(`Query "${actionName}" prohibited for root execution!`);
          }

          const {
            allow: { [entityName]: actions },
          } = derivative[currentSuffix];

          if (!actions) {
            throw new TypeError(
              `For action "${actionName}" not allowed entity: "${entityName}" with derfivative suffix: "${currentSuffix}"!`,
            );
          }

          if (!actions.includes(baseAction)) {
            throw new TypeError(
              `For action "${actionName}" not found baseAction: "${baseAction}" with derfivative suffix: "${currentSuffix}" & entity: ${entityName}!`,
            );
          }

          const entityConfig = actionAttributes[baseAction].actionReturnConfig
            ? composeDerivativeConfigByName(currentSuffix, entityConfigs[entityName], generalConfig)
            : null;

          if (suffix) {
            throw new TypeError(
              `Need not set suffix: "${suffix}" for action "${actionName}" & entity: "${entityName}"!`,
            );
          }

          return {
            creationType: 'derivative',
            entityConfig,
            baseAction,
            suffix: currentSuffix,
          };
        }
      }
    }
  }

  throw new TypeError(`Got not used actionName: "${actionName}"!`);
};

export default parseAction;
