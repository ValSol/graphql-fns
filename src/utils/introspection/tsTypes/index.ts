import type {
  ClientOptions,
  DescendantAttributes,
  InventoryByRoles,
  EntityConfig,
} from '../../../tsTypes';

export type ActionToParse = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  entityName: string;
  descendantKey?: string;
};

export type ParsedAction = {
  creationType: 'standard' | 'custom' | 'descendant';
  entityConfig: EntityConfig | null;
  baseAction: string;
  descendantKey: string;
};

export type ChildQueries = Array<{
  actionName: string;
  baseAction: string;
  descendantKey: string;
  entityName: string;
}>;

export type ParseActionArgs = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  options: ClientOptions;
  descendantKey?: string;
  entityName: string;
};

export type ParseActionResult = {
  inventoryByRoles: InventoryByRoles;
  descendantAttributes: {
    [descendantKey: string]: DescendantAttributes;
  };
  maxShift: number;
};
