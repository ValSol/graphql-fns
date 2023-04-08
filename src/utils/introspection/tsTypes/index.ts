import type {
  ClientOptions,
  DerivativeAttributes,
  InventoryByRoles,
  EntityConfig,
} from '../../../tsTypes';

export type ActionToParse = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  entityName: string;
  derivativeKey?: string;
};

export type ParsedAction = {
  creationType: 'standard' | 'custom' | 'derivative';
  entityConfig: EntityConfig | null;
  baseAction: string;
  derivativeKey: string;
};

export type ChildQueries = Array<{
  actionName: string;
  baseAction: string;
  derivativeKey: string;
  entityName: string;
}>;

export type ParseActionArgs = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  options: ClientOptions;
  derivativeKey?: string;
  entityName: string;
};

export type ParseActionResult = {
  inventoryByRoles: InventoryByRoles;
  derivativeAttributes: {
    [derivativeKey: string]: DerivativeAttributes;
  };
  maxShift: number;
};
