// @flow

import type { GeneralConfig } from '../../flowTypes';
import type { ActionToParse, ParsedAction } from './flowTypes';

import actionAttributes from '../../types/actionAttributes';
import composeDerivativeConfigByName from '../composeDerivativeConfigByName';

const toOtherType = {
  Query: 'Mutation',
  Mutation: 'Query',
};

const prohibitedForRootActions = ['childThing', 'childThings'];

const parseAction = (
  { actionType, actionName, thingName, suffix }: ActionToParse,
  generalConfig: GeneralConfig,
): ParsedAction => {
  const { thingConfigs, custom, derivative } = generalConfig;

  if (!thingConfigs[thingName]) {
    throw new TypeError(`Not found thing with name: "${thingName}"!`);
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
      throw new TypeError(`Not setted suffix for action "${actionName}" & thing: "${thingName}"!`);
    }

    const thingConfig = attributes.actionReturnConfig ? thingConfigs[thingName] : null;

    return {
      creationType: 'standard',
      thingConfig,
      baseAction: '',
      suffix,
    };
  }

  if (custom) {
    if (custom[actionType] && custom[actionType][actionName]) {
      const signatureMethods = custom[actionType][actionName];

      const thingConfig = signatureMethods.config(thingConfigs[thingName], generalConfig);

      let calculatedSuffix = '';

      if (thingConfig && derivative && !thingConfigs[thingConfig.name]) {
        const { name } = thingConfig;
        const suffixes = Object.keys(derivative);

        for (let i = 0; i < suffixes.length; i += 1) {
          const currentSuffix = suffixes[i];
          if (name.endsWith(currentSuffix)) {
            const baseName = name.slice(0, -currentSuffix.length);
            if (thingConfigs[baseName]) {
              calculatedSuffix = currentSuffix;
              break;
            }
          }
        }
      }

      if (calculatedSuffix && suffix && calculatedSuffix !== suffix) {
        throw new TypeError(
          `Setted suffix: "${suffix}" not equal to calculated suffix "${calculatedSuffix}" for action "${actionName}" & thing: "${thingName}"!`,
        );
      }

      if (!calculatedSuffix && !suffix) {
        throw new TypeError(
          `Not setted suffix for action "${actionName}" & thing: "${thingName}"!`,
        );
      }

      return {
        creationType: 'custom',
        thingConfig,
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
            allow: { [thingName]: actions },
          } = derivative[currentSuffix];

          if (!actions) {
            throw new TypeError(
              `For action "${actionName}" not allowed thing: "${thingName}" with derfivative suffix: "${currentSuffix}"!`,
            );
          }

          if (!actions.includes(baseAction)) {
            throw new TypeError(
              `For action "${actionName}" not found baseAction: "${baseAction}" with derfivative suffix: "${currentSuffix}" & thing: ${thingName}!`,
            );
          }

          const thingConfig = actionAttributes[baseAction].actionReturnConfig
            ? composeDerivativeConfigByName(currentSuffix, thingConfigs[thingName], generalConfig)
            : null;

          if (suffix) {
            throw new TypeError(
              `Need not set suffix: "${suffix}" for action "${actionName}" & thing: "${thingName}"!`,
            );
          }

          return {
            creationType: 'derivative',
            thingConfig,
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
