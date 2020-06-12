// @flow
import type {
  GeneralConfig,
  ServersideConfig,
  ThingConfig,
  ThreeSegmentInventoryChain,
} from '../flowTypes';

import checkInventory from '../utils/checkInventory';
import mergeDerivativeIntoCustom from '../utils/mergeDerivativeIntoCustom';
import composeActionSignature from '../types/composeActionSignature';
import executeAuthorisation from './executeAuthorisation';

const createCustomResolver = (
  methodKind: 'Query' | 'Mutation',
  methodName: string,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | Function => {
  const { name } = thingConfig;

  const { inventory } = generalConfig;

  const custom = mergeDerivativeIntoCustom(generalConfig);

  if (!custom) {
    throw new TypeError('"custom" property have to be defined!');
  }
  const { [methodKind]: methodFolder } = custom;
  if (!methodFolder) {
    throw new TypeError(`"${methodKind}" property have to be defined!`);
  }
  const { [methodName]: signatureMethods } = methodFolder;

  if (!composeActionSignature(signatureMethods, thingConfig, generalConfig)) return null;

  // $FlowFixMe - cannot understand what the conflict between 'Query' & 'Mutation'
  const inventoryChain: ThreeSegmentInventoryChain = [methodKind, methodName, name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  if (!serversideConfig[methodKind] || !serversideConfig[methodKind][methodName]) {
    throw new TypeError(`Have to set "${methodKind}" of "${methodName}" `);
  }

  const authDecorator = (func) => async (...argarray) => {
    const [parent, args, context, info] = argarray;
    if (!(await executeAuthorisation(inventoryChain, context, serversideConfig))) return null;
    const result = await func(parent, args, context, info);
    return result;
  };

  return authDecorator(
    serversideConfig[methodKind][methodName](thingConfig, generalConfig, serversideConfig),
  );
};

export default createCustomResolver;
