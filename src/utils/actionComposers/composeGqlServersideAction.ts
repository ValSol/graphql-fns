import mutations from '../../resolvers/mutations';
import queries from '../../resolvers/queries';
import parseActionName from '../introspection/parseActionName';

import composeProjectionFromOptions from './composeProjectionFromOptions';

import type { GeneralConfig, GqlActionData, ServersideConfig } from '../../tsTypes';

const toOtherType = {
  Query: 'Mutation',
  Mutation: 'Query',
} as const;

const baseResolvers = { Mutation: mutations, Query: queries } as const;

const composeGqlServersideAction = (
  gqlActionData: GqlActionData,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  optionsArg: any = {},
): any => {
  const { actionType, actionName, entityName } = gqlActionData;

  const { allEntityConfigs } = generalConfig;

  let {
    [actionType]: { [actionName]: resolver },
  } = serversideConfig;

  if (!resolver) {
    const {
      [toOtherType[actionType]]: { [actionName]: resolver2 },
    } = serversideConfig;

    if (resolver2) {
      throw new TypeError(
        `Custom ${toOtherType[actionType]} "${actionName}" declared as "${actionType}"!`,
      );
    }
    const { baseAction } = parseActionName(gqlActionData, generalConfig);

    resolver = baseResolvers[actionType][baseAction || actionName];

    if (!resolver) {
      throw new TypeError(`Not found ${actionType}: "${actionName}" for entity: "${entityName}"!`);
    }
  }

  const inAnyCase = true; // not check permissions if serverside execution

  return {
    resolver: resolver(allEntityConfigs[entityName], generalConfig, serversideConfig, inAnyCase),
    projection: composeProjectionFromOptions(gqlActionData, generalConfig, optionsArg),
  };
};

export default composeGqlServersideAction;
