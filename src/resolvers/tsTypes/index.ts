import type {
  DataObject,
  GeneralConfig,
  GraphqlObject,
  Periphery,
  ResolverArg,
  ServersideConfig,
  EntityConfig,
  TangibleEntityConfig,
} from '../../tsTypes';

export type Core = Map<TangibleEntityConfig, DataObject[]>;

export type ResolverCreatorArg = {
  entityConfig: EntityConfig;
  generalConfig: GeneralConfig;
  serversideConfig: ServersideConfig;
  inAnyCase?: boolean;
};

export type PreparedData = {
  mains: GraphqlObject[];
  core: Core;
  periphery: Periphery;
};

export type PrepareBulkData = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  preparedData: PreparedData,
) => Promise<PreparedData>;

export type Report = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | ((arg1: { previous?: GraphqlObject[]; current?: GraphqlObject[] }) => void)>;

export type GetPrevious = (
  actionGeneralName: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | GraphqlObject[]>;

export type Loophole = (
  actionGeneralName: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<GraphqlObject | GraphqlObject[] | null>;

export type ResolverAttributes = {
  actionGeneralName: string;
  array: boolean;
  getPrevious?: GetPrevious;
  produceCurrent?: boolean;
  prepareBulkData?: PrepareBulkData;
  report?: Report;
  finalResult?: (arg1: {
    previous: GraphqlObject[];
    current: GraphqlObject[];
  }) => GraphqlObject | GraphqlObject[] | number;
  loophole?: Loophole;
};
