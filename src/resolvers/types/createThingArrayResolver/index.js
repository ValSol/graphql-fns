// @flow

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';

import createChildThingsQueryResolver from '../../queries/createChildThingsQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import parseThingName from '../parseThingName';

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

  const childThingsQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `childThings${nameSuffix}`,
        thingConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : createChildThingsQueryResolver(thingConfig, generalConfig, serversideConfig);

  if (!childThingsQueryResolver) {
    throw new TypeError(
      `Not defined childThingsQueryResolver "${
        nameSuffix ? `childThings${nameSuffix}` : 'childThings'
      }" for thing: "${thingConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = nameSuffix
    ? ['Query', `childThings${nameSuffix}`, nameRoot]
    : ['Query', 'childThings', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          nameSuffix ? `childThings${nameSuffix}` : 'childThings'
        }" for thing: "${thingConfigs[nameRoot].name}"!`,
      );
    }

    return childThingsQueryResolver(parent, args, context, info, filter);
  };

  return resolver;
};

export default createThingArrayResolver;
