import type { EntityConfig, GeneralConfig, DescendantAttributesActionName } from '../../tsTypes';

import actionAttributes from '@/types/actionAttributes';
import checkInventory from '../inventory/checkInventory';
import parseEntityName from '../parseEntityName';

const checkDescendantAction = (
  actionBaseGeneralName: DescendantAttributesActionName,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
) => {
  const { descendant, inventory } = generalConfig;
  const { root: nameRoot, descendantKey } = parseEntityName(entityConfig.name, generalConfig);

  const { actionGeneralName, actionType } = actionAttributes[actionBaseGeneralName];

  if (!descendantKey) {
    if (inventory) {
      return checkInventory([actionType, actionGeneralName(''), nameRoot], inventory);
    } else {
      return true;
    }
  }

  const allow = descendant?.[descendantKey]?.allow?.[nameRoot];

  if (!allow) {
    throw new TypeError(
      `Not found descendant "allow" attribute in "${descendantKey}" descendant for "${nameRoot}" entity!`,
    );
  }

  if (!allow.includes(actionBaseGeneralName)) {
    return false;
  }

  if (inventory) {
    return checkInventory([actionType, actionGeneralName(descendantKey), nameRoot], inventory);
  } else {
    return true;
  }
};

export default checkDescendantAction;
