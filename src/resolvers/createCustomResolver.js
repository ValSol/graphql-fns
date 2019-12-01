// @flow
import type {
  GeneralConfig,
  ServersideConfig,
  ThingConfig,
  ThreeSegmentInventoryChain,
} from '../flowTypes';

import executeAuthorisation from './executeAuthorisation';
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

  // $FlowFixMe - cannot understand what the conflict between 'Query' & 'Mutation'
  const inventoryChain: ThreeSegmentInventoryChain = [methodKind, methodName, name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  if (!serversideConfig[methodKind] || !serversideConfig[methodKind][methodName]) {
    throw new TypeError(`Have to set "${methodKind}" of "${methodName}" `);
  }

  const authDecorator = func => async (...argarray) => {
    const [parent, args, context, info] = argarray;
    const resolverArgs = { parent, args, context, info };
    await executeAuthorisation({
      inventoryChain,
      resolverArgs,
      serversideConfig,
      returnScalar:
        serversideConfig.returnScalar &&
        serversideConfig.returnScalar[methodKind] &&
        serversideConfig.returnScalar[methodKind][methodName],
    });
    const result = await func(parent, args, context, info);
    return result;
  };

  return authDecorator(
    serversideConfig[methodKind][methodName](thingConfig, generalConfig, serversideConfig),
  );
};

export default createCustomResolver;
