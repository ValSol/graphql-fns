import type {
  ClientOptions,
  RepresentationAttributes,
  InventoryByRoles,
  EntityConfig,
} from '@/tsTypes';

export type ActionToParse = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  entityName: string;
  representationKey?: string;
};

export type ParsedAction = {
  creationType: 'standard' | 'custom' | 'representation';
  entityConfig: EntityConfig | null;
  baseAction: string;
  representationKey: string;
};

export type ChildQueries = Array<{
  actionName: string;
  baseAction: string;
  representationKey: string;
  entityName: string;
}>;

export type ParseActionArgs = {
  actionType: 'Query' | 'Mutation';
  actionName: string;
  options: ClientOptions;
  representationKey?: string;
  entityName: string;
};

export type ParseActionResult = {
  inventoryByRoles: InventoryByRoles;
  representationAttributes: {
    [representationKey: string]: RepresentationAttributes;
  };
  maxShift: number;
};
