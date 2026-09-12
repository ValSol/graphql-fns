import type { GeneralConfig } from '../../tsTypes';
import type { ParseActionArgs, ParseActionResult } from './tsTypes';

import parseAction from './parseAction';

const parseActions = (
  actions: ParseActionArgs[],
  representationKeyToPermission: {
    [representationKey: string]: string;
  },
  generalConfig: GeneralConfig,
): ParseActionResult => {
  const representationAttributes: Record<string, any> = {};
  const inventoryByRoles: Record<string, any> = {};
  let maxShift = 0;

  actions.forEach((action) => {
    maxShift = parseAction(
      { ...action, generalConfig, representationKeyToPermission },
      { maxShift, representationAttributes, inventoryByRoles },
    ).maxShift;
  });

  return {
    inventoryByRoles,
    representationAttributes,
    maxShift,
  };
};

export default parseActions;
