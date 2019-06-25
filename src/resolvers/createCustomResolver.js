// @flow
import type { GeneralConfig, ServersideConfig, ThingConfig } from '../flowTypes';

import checkInventory from '../utils/checkInventory';

const createCustomResolver = (
  methodKind: 'Query' | 'Mutation',
  methodName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | Function => {
  const { name } = thingConfig;
  const { inventory } = generalConfig;

  // $FlowFixMe
  if (!checkInventory([methodKind, methodName, name], inventory)) return null;

  // $FlowFixMe
  return serversideConfig[methodKind][methodName](thingConfig, generalConfig);
};

export default createCustomResolver;
