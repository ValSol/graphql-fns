import type { GeneralConfig } from '../../tsTypes';
import type { ParseActionArgs, ParseActionResult } from './tsTypes';

import parseAction from './parseAction';

const parseActions = (
  actions: ParseActionArgs[],
  descendantKeyToPermission: {
    [descendantKey: string]: string;
  },
  generalConfig: GeneralConfig,
): ParseActionResult => {
  const descendantAttributes: Record<string, any> = {};
  const inventoryByRoles: Record<string, any> = {};
  let maxShift = 0;

  actions.forEach((action) => {
    maxShift = parseAction(
      { ...action, generalConfig, descendantKeyToPermission },
      { maxShift, descendantAttributes, inventoryByRoles },
    ).maxShift;
  });

  return {
    inventoryByRoles,
    descendantAttributes,
    maxShift,
  };
};

export default parseActions;
