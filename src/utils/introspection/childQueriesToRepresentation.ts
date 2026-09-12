import type { RepresentationAttributes, RepresentationAttributesActionName } from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const childQueriesToRepresentation = (
  childQueries: ChildQueries,
  representationAttributes: {
    [representationKey: string]: RepresentationAttributes;
  },
): {
  [representationKey: string]: RepresentationAttributes;
} => {
  childQueries.forEach(({ actionName, baseAction, representationKey, entityName }) => {
    if (actionName === baseAction) return;

    if (!representationAttributes[representationKey]) {
      representationAttributes[representationKey] = { representationKey, allow: {} };
    }

    if (!representationAttributes[representationKey].allow[entityName]) {
      representationAttributes[representationKey].allow[entityName] = [];
    }

    if (
      !representationAttributes[representationKey].allow[entityName].includes(
        baseAction as RepresentationAttributesActionName,
      )
    ) {
      representationAttributes[representationKey].allow[entityName].push(
        baseAction as RepresentationAttributesActionName,
      );
    }
  });

  return representationAttributes;
};

export default childQueriesToRepresentation;
