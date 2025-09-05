import type { DescendantAttributesActionName, GeneralConfig } from '@/tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import actionAttributes from '@/types/actionAttributes';

const toOtherType = {
  Query: 'Mutation',
  Mutation: 'Query',
} as const;

const prohibitedForRootActions = ['childEntity', 'childEntities'];

const parseAction = (
  { actionType, actionName, entityName, descendantKey }: ActionToParse,
  generalConfig: GeneralConfig,
): ParsedAction => {
  const { allEntityConfigs, custom, descendant } = generalConfig;

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

    if (!descendantKey) {
      throw new TypeError(
        `Not setted descendantKey for action "${actionName}" & entity: "${entityName}"!`,
      );
    }

    const entityConfig = attributes.actionReturnConfig(allEntityConfigs[entityName], generalConfig);

    return {
      creationType: 'standard',
      entityConfig,
      baseAction: '',
      descendantKey,
    };
  }

  if (custom) {
    if (custom[actionType] && custom[actionType][actionName]) {
      const signatureMethods = custom[actionType][actionName];

      const entityConfig = signatureMethods.config(allEntityConfigs[entityName], generalConfig);

      let calculatedDescendantKey = '';

      if (entityConfig && descendant && !allEntityConfigs[entityConfig.name]) {
        const { name } = entityConfig;
        const descendantKeys = Object.keys(descendant);

        for (let i = 0; i < descendantKeys.length; i += 1) {
          const currentDescendantKey = descendantKeys[i];
          if (name.endsWith(currentDescendantKey)) {
            const baseName = name.slice(0, -currentDescendantKey.length);
            if (allEntityConfigs[baseName]) {
              calculatedDescendantKey = currentDescendantKey;
              break;
            }
          }
        }
      }

      if (calculatedDescendantKey && descendantKey && calculatedDescendantKey !== descendantKey) {
        throw new TypeError(
          `Setted descendantKey: "${descendantKey}" not equal to calculated descendantKey "${calculatedDescendantKey}" for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      if (!calculatedDescendantKey && !descendantKey) {
        throw new TypeError(
          `Not setted descendantKey for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      return {
        creationType: 'custom',
        entityConfig,
        baseAction: '',
        descendantKey: calculatedDescendantKey || descendantKey || '', // last || '' added to prevent flowjs error
      };
    }

    if (custom[toOtherType[actionType]] && custom[toOtherType[actionType]][actionName]) {
      throw new TypeError(
        `Custom ${toOtherType[actionType]} "${actionName}" declared as "${actionType}"!`,
      );
    }
  }

  if (descendant) {
    const descendantKeys = Object.keys(descendant);

    for (let i = 0; i < descendantKeys.length; i += 1) {
      const currentDescendantKey = descendantKeys[i];

      if (actionName.endsWith(currentDescendantKey)) {
        const baseAction = actionName.slice(0, -currentDescendantKey.length);

        if (actionAttributes[baseAction]) {
          if (prohibitedForRootActions.includes(baseAction)) {
            throw new TypeError(`Query "${actionName}" prohibited for root execution!`);
          }

          const {
            allow: { [entityName]: actions },
          } = descendant[currentDescendantKey];

          if (!actions) {
            throw new TypeError(
              `For action "${actionName}" not allowed entity: "${entityName}" with derfivative descendantKey: "${currentDescendantKey}"!`,
            );
          }

          if (!actions.includes(baseAction as DescendantAttributesActionName)) {
            throw new TypeError(
              `For action "${actionName}" not found baseAction: "${baseAction}" with derfivative descendantKey: "${currentDescendantKey}" & entity: ${entityName}!`,
            );
          }

          const entityConfig = actionAttributes[baseAction].actionReturnConfig(
            allEntityConfigs[entityName],
            generalConfig,
            currentDescendantKey,
          );

          if (descendantKey) {
            throw new TypeError(
              `Need not set descendantKey: "${descendantKey}" for action "${actionName}" & entity: "${entityName}"!`,
            );
          }

          return {
            creationType: 'descendant',
            entityConfig,
            baseAction,
            descendantKey: currentDescendantKey,
          };
        }
      }
    }
  }

  throw new TypeError(`Got not used actionName: "${actionName}"!`);
};

export default parseAction;
