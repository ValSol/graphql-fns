import type {
  DescendantAttributes,
  DescendantAttributesActionName,
  GeneralConfig,
} from '../../tsTypes';
import type { ActionToParse, ParsedAction } from './tsTypes';

const actionToDescendant = (
  actionToParse: ActionToParse,
  parsedAction: ParsedAction,
  descendantAttributes: {
    [descendantKey: string]: DescendantAttributes;
  },
  generalConfig: GeneralConfig,
): {
  [descendantKey: string]: DescendantAttributes;
} => {
  const { actionName, entityName } = actionToParse;
  const { baseAction, creationType, descendantKey, entityConfig } = parsedAction;

  const { allEntityConfigs } = generalConfig;

  if (creationType !== 'descendant' && (!entityConfig || allEntityConfigs[entityConfig.name])) {
    return descendantAttributes;
  }

  const returningThingName = entityConfig
    ? entityConfig.name.slice(0, -descendantKey.length)
    : entityName;

  if (!allEntityConfigs[returningThingName]) return descendantAttributes;

  if (!descendantAttributes[descendantKey]) {
    descendantAttributes[descendantKey] = { descendantKey, allow: {} }; // eslint-disable-line no-param-reassign
  }

  if (!descendantAttributes[descendantKey].allow[returningThingName]) {
    descendantAttributes[descendantKey].allow[returningThingName] = []; // eslint-disable-line no-param-reassign
  }

  if (
    baseAction &&
    baseAction !== actionName &&
    !descendantAttributes[descendantKey].allow[returningThingName].includes(
      baseAction as DescendantAttributesActionName,
    )
  ) {
    descendantAttributes[descendantKey].allow[returningThingName].push(
      baseAction as DescendantAttributesActionName,
    );
  }

  return descendantAttributes;
};

export default actionToDescendant;
