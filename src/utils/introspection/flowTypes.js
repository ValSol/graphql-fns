// @flow

import type {
  ClientOptions,
  DerivativeAttributes,
  InventoryByPermissions,
  ThingConfig,
} from '../../flowTypes';

export type ActionToParse = {
  actionType: string, //  'Query' | 'Mutation',
  actionName: string,
  thingName: string,
  suffix?: string,
};

export type ParsedAction = {
  creationType: 'standard' | 'custom' | 'derivative',
  thingConfig: ThingConfig | null,
  baseAction: string,
  suffix: string,
};

export type ChildQueries = Array<{
  actionName: string,
  baseAction: string,
  suffix: string,
  thingName: string,
}>;

export type ParseActionArgs = {
  actionType: 'Query' | 'Mutation',
  actionName: string,
  options: ClientOptions,
  suffix?: string,
  thingName: string,
};

export type ParseActionResult = {
  inventoryByPermissions: InventoryByPermissions,
  derivativeAttributes: { [suffix: string]: DerivativeAttributes },
  maxShift: number,
};
