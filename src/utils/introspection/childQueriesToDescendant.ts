import type { DescendantAttributes, DescendantAttributesActionName } from '../../tsTypes';
import type { ChildQueries } from './tsTypes';

const childQueriesToDescendant = (
  childQueries: ChildQueries,
  descendantAttributes: {
    [descendantKey: string]: DescendantAttributes;
  },
): {
  [descendantKey: string]: DescendantAttributes;
} => {
  childQueries.forEach(({ actionName, baseAction, descendantKey, entityName }) => {
    if (actionName === baseAction) return;

    if (!descendantAttributes[descendantKey]) {
      descendantAttributes[descendantKey] = { descendantKey, allow: {} };
    }

    if (!descendantAttributes[descendantKey].allow[entityName]) {
      descendantAttributes[descendantKey].allow[entityName] = [];
    }

    if (
      !descendantAttributes[descendantKey].allow[entityName].includes(
        baseAction as DescendantAttributesActionName,
      )
    ) {
      descendantAttributes[descendantKey].allow[entityName].push(
        baseAction as DescendantAttributesActionName,
      );
    }
  });

  return descendantAttributes;
};

export default childQueriesToDescendant;
