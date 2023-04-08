import type { GeneralConfig } from '../../tsTypes';
import type { ParseActionArgs, ParseActionResult } from './tsTypes';

import parseAction from './parseAction';

const parseActions = (
  actions: ParseActionArgs[],
  derivativeKeyToPermission: {
    [derivativeKey: string]: string;
  },
  generalConfig: GeneralConfig,
): ParseActionResult => {
  const derivativeAttributes: Record<string, any> = {};
  const inventoryByRoles: Record<string, any> = {};
  let maxShift = 0;

  actions.forEach((action) => {
    maxShift = parseAction(
      { ...action, generalConfig, derivativeKeyToPermission },
      { maxShift, derivativeAttributes, inventoryByRoles },
    ).maxShift;
  });

  return {
    inventoryByRoles,
    derivativeAttributes,
    maxShift,
  };
};

export default parseActions;
