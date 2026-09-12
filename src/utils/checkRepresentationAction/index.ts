import type {
  EntityConfig,
  GeneralConfig,
  RepresentationAttributesActionName,
} from '../../tsTypes';

import actionAttributes from '@/types/actionAttributes';
import checkInventory from '../inventory/checkInventory';
import parseEntityName from '../parseEntityName';

const checkRepresentationAction = (
  actionBaseGeneralName: RepresentationAttributesActionName,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
) => {
  const { representation, inventory } = generalConfig;
  const { root: nameRoot, representationKey } = parseEntityName(entityConfig.name, generalConfig);

  const { actionGeneralName, actionType } = actionAttributes[actionBaseGeneralName];

  if (!representationKey) {
    if (inventory) {
      return checkInventory([actionType, actionGeneralName(''), nameRoot], inventory);
    } else {
      return true;
    }
  }

  const allow = representation?.[representationKey]?.allow?.[nameRoot];

  if (!allow) {
    throw new TypeError(
      `Not found representation "allow" attribute in "${representationKey}" representation for "${nameRoot}" entity!`,
    );
  }

  if (!allow.includes(actionBaseGeneralName)) {
    return false;
  }

  if (inventory) {
    return checkInventory([actionType, actionGeneralName(representationKey), nameRoot], inventory);
  } else {
    return true;
  }
};

export default checkRepresentationAction;
