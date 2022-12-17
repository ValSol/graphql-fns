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
  derivativeKey?: string,
};

export type ParsedAction = {
  creationType: 'standard' | 'custom' | 'derivative',
  entityConfig: EntityConfig | null,
  baseAction: string,
  derivativeKey: string,
};

export type ChildQueries = Array<{
  actionName: string,
  baseAction: string,
  derivativeKey: string,
  entityName: string,
}>;

export type ParseActionArgs = {
  actionType: 'Query' | 'Mutation',
  actionName: string,
  options: ClientOptions,
  derivativeKey?: string,
  entityName: string,
};

export type ParseActionResult = {
  inventoryByPermissions: InventoryByPermissions,
  derivativeAttributes: { [derivativeKey: string]: DerivativeAttributes },
  maxShift: number,
};
