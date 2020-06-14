// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import createThingsQueryResolver from '../queries/createThingsQueryResolver';
import executeAuthorisation from '../executeAuthorisation';
import createCustomResolver from '../createCustomResolver';
import parseThingName from './parseThingName';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingArrayResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;
  const { thingConfigs } = generalConfig;

  const { root: nameRoot, suffix: nameSuffix } = parseThingName(name, generalConfig);

  const thingsQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `things${nameSuffix}`,
        thingConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : createThingsQueryResolver(thingConfig, generalConfig, serversideConfig);

  if (!thingsQueryResolver) return null;

  const inventoryChain = nameSuffix
    ? ['Query', `things${nameSuffix}`, nameRoot]
    : ['Query', 'things', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    if (!(await executeAuthorisation(inventoryChain, context, serversideConfig))) return null;

    const { fieldName } = info;

    const ids = parent[fieldName];

    if (!ids || !ids.length) return [];

    const things = await thingsQueryResolver(null, { where: { id_in: ids } }, context, info);

    return things;
  };

  return resolver;
};

export default createThingArrayResolver;
