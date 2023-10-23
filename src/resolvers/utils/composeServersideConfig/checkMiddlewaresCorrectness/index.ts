import type { GeneralConfig, Middlewares } from '../../../../tsTypes';

import actionAttributes from '../../../../types/actionAttributes';
import checkInventory from '../../../../utils/inventory/checkInventory';

const checkMiddlewaresCorrectness = (middlewares: Middlewares, generalConfig: GeneralConfig) => {
  if (Object.keys(middlewares).length === 0) {
    return { unfound: [], noFunc: [] };
  }

  const { allEntityConfigs, descendant, inventory } = generalConfig;

  const entityNames = Object.keys(allEntityConfigs);

  const descendantKeys = descendant ? Object.keys(descendant) : [];

  const actionNames: string[] = Object.keys(actionAttributes).reduce((prev, key) => {
    const {
      actionAllowed,
      actionGeneralName: actionGeneralNameComposer,
      actionIsChild,
      actionName: actionNameComposer,
      actionType,
    } = actionAttributes[key];

    if ((actionType !== 'Query' && actionType !== 'Mutation') || actionIsChild) {
      return prev;
    }

    const actionGeneralName = actionGeneralNameComposer('');

    entityNames.forEach((entityName) => {
      const entityConfig = allEntityConfigs[entityName];

      if (
        actionAllowed(entityConfig) &&
        (!inventory || checkInventory([actionType, actionGeneralName, entityName], inventory))
      ) {
        return prev.push(actionNameComposer(entityName));
      }
    });

    return prev;
  }, []);

  descendantKeys.reduce((prev, descendantKey) => {
    const descendantAttributes = descendant[descendantKey];

    const { allow } = descendantAttributes;

    Object.keys(allow).forEach((entityName) => {
      allow[entityName].forEach((key) => {
        const {
          actionGeneralName: actionGeneralNameComposer,
          actionName: actionNameComposer,
          actionType,
        } = actionAttributes[key];

        const actionGeneralName = actionGeneralNameComposer(descendantKey);

        if (!inventory || checkInventory([actionType, actionGeneralName, entityName], inventory)) {
          return prev.push(actionNameComposer(entityName, descendantKey));
        }
      });
    });

    return prev;
  }, actionNames);

  const result = Object.keys(middlewares).reduce(
    (prev, actionName) => {
      if (!actionNames.includes(actionName)) {
        prev.unfound.push(actionName);
      } else if (typeof middlewares[actionName] !== 'function') {
        prev.noFunc.push(actionName);
      }

      return prev;
    },
    { unfound: [], noFunc: [] },
  );

  return result;
};

export default checkMiddlewaresCorrectness;
