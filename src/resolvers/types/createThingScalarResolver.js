// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../flowTypes';

import createThingQueryResolver from '../queries/createThingQueryResolver';
import executeAuthorisation from '../executeAuthorisation';
import createCustomResolver from '../createCustomResolver';
import parseThingName from './parseThingName';

type Args = { where: { id: string } };
type Context = { mongooseConn: Object };

const createThingScalarResolver = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = thingConfig;
  const { thingConfigs } = generalConfig;

  const { root: nameRoot, suffix: nameSuffix } = parseThingName(name, generalConfig);

  const thingQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `thing${nameSuffix}`,
        thingConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : createThingQueryResolver(thingConfig, generalConfig, serversideConfig);
  if (!thingQueryResolver) return null;

  const inventoryChain = nameSuffix
    ? ['Query', `thing${nameSuffix}`, name]
    : ['Query', 'thing', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    if (!(await executeAuthorisation(inventoryChain, context, serversideConfig))) return null;

    const { fieldName } = info;

    const id = parent[fieldName];

    if (!id) return null;

    const thing = await thingQueryResolver(null, { whereOne: { id } }, context, info);

    if (!thing) return null; // if there's broken link

    return thing;
  };

  return resolver;
};

export default createThingScalarResolver;
