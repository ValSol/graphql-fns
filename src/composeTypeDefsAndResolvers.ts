import type {GeneralConfig, ServersideConfig} from './tsTypes';

import composeGqlResolvers from './resolvers/composeGqlResolvers';
import composeGqlTypes from './types/composeGqlTypes';

const composeTypeDefsAndResolvers = (generalConfig: GeneralConfig, serversideConfig?: ServersideConfig): {
  typeDefs: string,
  resolvers: any
} => {
  const { typeDefs, entityTypeDic } = composeGqlTypes(generalConfig);

  const resolvers = composeGqlResolvers(generalConfig, entityTypeDic, serversideConfig);

  return { typeDefs, resolvers };
};

export default composeTypeDefsAndResolvers;
