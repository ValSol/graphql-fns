// @flow

import type {
  ClientOptions,
  DerivativeAttributes,
  InventoryByPermissions,
  EntityConfig,
} from '../../flowTypes';

export type ActionToParse = {
  actionType: string, //  'Query' | 'Mutation',
  actionName: string,
  entityName: string,
  suffix?: string,
};

export type ParsedAction = {
  creationType: 'standard' | 'custom' | 'derivative',
  entityConfig: EntityConfig | null,
  baseAction: string,
  suffix: string,
};

export type ChildQueries = Array<{
  actionName: string,
  baseAction: string,
  suffix: string,
  entityName: string,
}>;

export type ParseActionArgs = {
  actionType: 'Query' | 'Mutation',
  actionName: string,
  options: ClientOptions,
  suffix?: string,
  entityName: string,
};

export type ParseActionResult = {
  inventoryByPermissions: InventoryByPermissions,
  derivativeAttributes: { [suffix: string]: DerivativeAttributes },
  maxShift: number,
};
