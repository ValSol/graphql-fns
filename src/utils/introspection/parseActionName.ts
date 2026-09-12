import type { RepresentationAttributesActionName, GeneralConfig } from '@/tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

import actionAttributes from '@/types/actionAttributes';

const toOtherType = {
  Query: 'Mutation',
  Mutation: 'Query',
} as const;

const prohibitedForRootActions = ['childEntity', 'childEntities'];

const parseAction = (
  { actionType, actionName, entityName, representationKey }: ActionToParse,
  generalConfig: GeneralConfig,
): ParsedAction => {
  const { allEntityConfigs, custom, representation } = generalConfig;

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

    if (!representationKey) {
      throw new TypeError(
        `Not setted representationKey for action "${actionName}" & entity: "${entityName}"!`,
      );
    }

    const entityConfig = attributes.actionReturnConfig(allEntityConfigs[entityName], generalConfig);

    return {
      creationType: 'standard',
      entityConfig,
      baseAction: '',
      representationKey,
    };
  }

  if (custom) {
    if (custom[actionType] && custom[actionType][actionName]) {
      const signatureMethods = custom[actionType][actionName];

      const entityConfig = signatureMethods.config(allEntityConfigs[entityName], generalConfig);

      let calculatedRepresentationKey = '';

      if (entityConfig && representation && !allEntityConfigs[entityConfig.name]) {
        const { name } = entityConfig;
        const representationKeys = Object.keys(representation);

        for (let i = 0; i < representationKeys.length; i += 1) {
          const currentRepresentationKey = representationKeys[i];
          if (name.endsWith(currentRepresentationKey)) {
            const baseName = name.slice(0, -currentRepresentationKey.length);
            if (allEntityConfigs[baseName]) {
              calculatedRepresentationKey = currentRepresentationKey;
              break;
            }
          }
        }
      }

      if (
        calculatedRepresentationKey &&
        representationKey &&
        calculatedRepresentationKey !== representationKey
      ) {
        throw new TypeError(
          `Setted representationKey: "${representationKey}" not equal to calculated representationKey "${calculatedRepresentationKey}" for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      if (!calculatedRepresentationKey && !representationKey) {
        throw new TypeError(
          `Not setted representationKey for action "${actionName}" & entity: "${entityName}"!`,
        );
      }

      return {
        creationType: 'custom',
        entityConfig,
        baseAction: '',
        representationKey: calculatedRepresentationKey || representationKey || '', // last || '' added to prevent flowjs error
      };
    }

    if (custom[toOtherType[actionType]] && custom[toOtherType[actionType]][actionName]) {
      throw new TypeError(
        `Custom ${toOtherType[actionType]} "${actionName}" declared as "${actionType}"!`,
      );
    }
  }

  if (representation) {
    const representationKeys = Object.keys(representation);

    for (let i = 0; i < representationKeys.length; i += 1) {
      const currentRepresentationKey = representationKeys[i];

      if (actionName.endsWith(currentRepresentationKey)) {
        const baseAction = actionName.slice(0, -currentRepresentationKey.length);

        if (actionAttributes[baseAction]) {
          if (prohibitedForRootActions.includes(baseAction)) {
            throw new TypeError(`Query "${actionName}" prohibited for root execution!`);
          }

          const {
            allow: { [entityName]: actions },
          } = representation[currentRepresentationKey];

          if (!actions) {
            throw new TypeError(
              `For action "${actionName}" not allowed entity: "${entityName}" with derfivative representationKey: "${currentRepresentationKey}"!`,
            );
          }

          if (!actions.includes(baseAction as RepresentationAttributesActionName)) {
            throw new TypeError(
              `For action "${actionName}" not found baseAction: "${baseAction}" with derfivative representationKey: "${currentRepresentationKey}" & entity: ${entityName}!`,
            );
          }

          const entityConfig = actionAttributes[baseAction].actionReturnConfig(
            allEntityConfigs[entityName],
            generalConfig,
            currentRepresentationKey,
          );

          if (representationKey) {
            throw new TypeError(
              `Need not set representationKey: "${representationKey}" for action "${actionName}" & entity: "${entityName}"!`,
            );
          }

          return {
            creationType: 'representation',
            entityConfig,
            baseAction,
            representationKey: currentRepresentationKey,
          };
        }
      }
    }
  }

  throw new TypeError(`Got not used actionName: "${actionName}"!`);
};

export default parseAction;
