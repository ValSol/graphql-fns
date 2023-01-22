// @flow
import type { GeneralConfig, ServersideConfig } from './flowTypes';

import composeGqlResolvers from './resolvers/composeGqlResolvers';
import composeGqlTypes from './types/composeGqlTypes';

const composeTypeDefsAndResolvers = (
  generalConfig: GeneralConfig,
  serversideConfig?: ServersideConfig,
): { typeDefs: string, resolvers: Object } => {
  const { typeDefs, entityTypeDic } = composeGqlTypes(generalConfig);

  const resolvers = composeGqlResolvers(generalConfig, entityTypeDic, serversideConfig);

  return { typeDefs, resolvers };
};

export default composeTypeDefsAndResolvers;
