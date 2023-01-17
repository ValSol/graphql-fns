// @flow

import type { GeneralConfig, Periphery, ServersideConfig, EntityConfig } from '../flowTypes';

export type Context = { mongooseConn: Object, pubsub?: Object };

export type ResolverCreatorArg = {
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
};

export type ResolverArg = {
  parent: Object,
  args: Object,
  context: Context,
  info: Object,
  involvedFilters: { [derivativeConfigName: string]: Array<Object> },
};

export type PreparedData = {
  mains: Array<Object>,
  core: Map<EntityConfig, Array<Object>>,
  periphery: Periphery,
};

export type PrepareBulkData = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  preparedData: PreparedData,
) => Promise<PreparedData>;

export type Report = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | (({ previous: Array<EntityConfig>, current: Array<EntityConfig> }) => void)>;

export type GetPrevious = (
  actionGeneralName: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | Array<Object>>;

export type Loophole = (
  actionGeneralName: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  filter?: Array<Object>,
) => Promise<any>;

export type ResolverAttributes = {
  actionGeneralName: string,
  array: boolean,
  getPrevious?: GetPrevious,
  produceCurrent?: boolean,
  prepareBulkData?: PrepareBulkData,
  report?: Report,
  finalResult?: ({ previous: Object, current: Object }) => any,
  loophole?: Loophole,
};
