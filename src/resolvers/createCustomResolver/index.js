// @flow
import type {
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  ThreeSegmentInventoryChain,
} from '../../flowTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import mergeDerivativeIntoCustom from '../../utils/mergeDerivativeIntoCustom';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import executeAuthorisation from '../utils/executeAuthorisation';
import customResolverDecorator from '../utils/resolverDecorator/customResolverDecorator';
import generateDerivativeResolvers from './generateDerivativeResolvers';

const createCustomResolver = (
  methodKind: 'Query' | 'Mutation',
  methodName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | Function => {
  const { name } = entityConfig;

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

  if (!signatureMethods) {
    throw new TypeError(`Got undefiend signatureMethods for "${methodName}" methodName!`);
  }

  if (!composeCustomActionSignature(signatureMethods, entityConfig, generalConfig)) return null;

  // $FlowFixMe - cannot understand what the conflict between 'Query' & 'Mutation'
  const inventoryChain: ThreeSegmentInventoryChain = [methodKind, methodName, name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  if (serversideConfig[methodKind]?.[methodName]) {
    const authDecorator =
      (func) =>
      async (...argarray) => {
        const [parent, args, context, info] = argarray;
        const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);
        if (!filter) return null;

        const result = await func(parent, args, context, info, filter);
        return result;
      };

    return customResolverDecorator(
      authDecorator(
        serversideConfig[methodKind][methodName](entityConfig, generalConfig, serversideConfig),
      ),
      signatureMethods,
      entityConfig,
      generalConfig,
    );
  }

  // use generated derivative resolvers

  const derivativeResolvers = generateDerivativeResolvers(generalConfig);

  if (!derivativeResolvers) {
    throw new TypeError(`Have to set the "${methodName}" ${methodKind}!`);
  }

  if (derivativeResolvers[methodKind]?.[methodName]) {
    const authDecorator =
      (func) =>
      async (...argarray) => {
        const [parent, args, context, info] = argarray;
        const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);
        if (!filter) return null;

        const result = await func(parent, args, context, info, filter);
        return result;
      };

    return customResolverDecorator(
      authDecorator(
        derivativeResolvers[methodKind][methodName](entityConfig, generalConfig, serversideConfig),
      ),
      signatureMethods,
      entityConfig,
      generalConfig,
    );
  }

  throw new TypeError(`Have to set the "${methodName}" ${methodKind}!`);
};

export default createCustomResolver;
