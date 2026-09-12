import type {
  RepresentationAttributes,
  RepresentationAttributesActionName,
  GeneralConfig,
} from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

const actionToRepresentation = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  representationAttributes: {
    [representationKey: string]: RepresentationAttributes;
  },
  generalConfig: GeneralConfig,
): {
  [representationKey: string]: RepresentationAttributes;
} => {
  const { actionName, entityName } = actionToParse;
  const { baseAction, creationType, representationKey, entityConfig } = parsedAction;

  const { allEntityConfigs } = generalConfig;

  if (creationType !== 'representation' && (!entityConfig || allEntityConfigs[entityConfig.name])) {
    return representationAttributes;
  }

  const returningThingName = entityConfig
    ? entityConfig.name.slice(0, -representationKey.length)
    : entityName;

  if (!allEntityConfigs[returningThingName]) return representationAttributes;

  if (!representationAttributes[representationKey]) {
    representationAttributes[representationKey] = { representationKey, allow: {} };
  }

  if (!representationAttributes[representationKey].allow[returningThingName]) {
    representationAttributes[representationKey].allow[returningThingName] = [];
  }

  if (
    baseAction &&
    baseAction !== actionName &&
    !representationAttributes[representationKey].allow[returningThingName].includes(
      baseAction as RepresentationAttributesActionName,
    )
  ) {
    representationAttributes[representationKey].allow[returningThingName].push(
      baseAction as RepresentationAttributesActionName,
    );
  }

  return representationAttributes;
};

export default actionToRepresentation;
