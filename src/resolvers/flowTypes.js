// @flow

import type { GeneralConfig, Periphery, ServersideConfig, ThingConfig } from '../flowTypes';

type Context = { mongooseConn: Object, pubsub?: Object };

type ResolverCreatorArg = {
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  inAnyCase?: boolean,
};

type ResolverArg = {
  parent: Object,
  args: Object,
  context: Context,
  info: Object,
  parentFilter: Array<Object>,
};

type Result = {
  core: Map<ThingConfig, Array<Object>>,
  periphery: Periphery,
  mains: Array<Object>,
  array: boolean,
  results: { previous: boolean, current: boolean },
  finalResult: ({ previous: Array<ThingConfig>, current: Array<ThingConfig> }) => any,
  subscription: null | (({ previous: Array<ThingConfig>, current: Array<ThingConfig> }) => void),
};

export type PrepareDataTo = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | Result>;

export type PrepareBulkData = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  previous: Array<Object>,
) => Promise<{
  core: Map<ThingConfig, Array<Object>>,
  periphery: Periphery,
  mains: Array<Object>,
}>;

export type Report = (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
) => Promise<null | (({ previous: Array<ThingConfig>, current: Array<ThingConfig> }) => void)>;

export type GetPrevious = (
  actionGeneralName: string,
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  filter?: Array<Object>,
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
