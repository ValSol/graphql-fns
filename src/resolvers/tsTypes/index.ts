import type {
  DataObject,
  GraphqlObject,
  Periphery,
  ResolverArg,
  ResolverCreatorArg,
  TangibleEntityConfig,
} from '../../tsTypes';

export type Core = Map<TangibleEntityConfig, DataObject[]>;

export type PreparedData = {
  mains: GraphqlObject[];
  core: Core;
  periphery: Periphery;
};

export type PrepareBulkData = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  preparedData: PreparedData,
  session: any,
) => Promise<PreparedData>;

export type Report = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | ((arg1: { previous?: GraphqlObject[]; current?: GraphqlObject[] }) => void)>;

export type GetPrevious = (
  actionGeneralName: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  session: any,
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
