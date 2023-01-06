// @flow

import type { GeneralConfig } from '../../flowTypes';
import type { ParseActionArgs, ParseActionResult } from './flowTypes';

import parseAction from './parseAction';

const parseActions = (
  actions: Array<ParseActionArgs>,
  derivativeKeyToPermission: { [derivativeKey: string]: string },
  generalConfig: GeneralConfig,
): ParseActionResult => {
  const derivativeAttributes = {};
  const inventoryByRoles = {};
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
