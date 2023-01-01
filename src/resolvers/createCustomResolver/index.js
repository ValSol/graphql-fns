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
  actionKind: 'Query' | 'Mutation',
  actionName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | Function => {
  const { name } = entityConfig;

  const { inventory } = generalConfig;

  const custom = mergeDerivativeIntoCustom(generalConfig, 'forCustomResolver');

  if (!custom) {
    throw new TypeError('"custom" property have to be defined!');
  }
  const { [actionKind]: customActionFolder } = custom;
  if (!customActionFolder) {
    throw new TypeError(`"${actionKind}" property have to be defined!`);
  }
  const { [actionName]: signatureMethods } = customActionFolder;

  if (!signatureMethods) {
    throw new TypeError(`Got undefiend signatureMethods for "${actionName}" actionName!`);
  }

  if (!composeCustomActionSignature(signatureMethods, entityConfig, generalConfig)) return null;

  // $FlowFixMe - cannot understand what the conflict between 'Query' & 'Mutation'
  const inventoryChain: ThreeSegmentInventoryChain = [actionKind, actionName, name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  if (serversideConfig[actionKind]?.[actionName]) {
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
        serversideConfig[actionKind][actionName](entityConfig, generalConfig, serversideConfig),
      ),
      signatureMethods,
      entityConfig,
      generalConfig,
    );
  }

  // use generated derivative resolvers

  const derivativeResolvers = generateDerivativeResolvers(generalConfig);

  if (!derivativeResolvers) {
    throw new TypeError(`Have to set the "${actionName}" ${actionKind}!`);
  }

  if (derivativeResolvers[actionKind]?.[actionName]) {
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
        derivativeResolvers[actionKind][actionName](entityConfig, generalConfig, serversideConfig),
      ),
      signatureMethods,
      entityConfig,
      generalConfig,
    );
  }

  throw new TypeError(`Have to set the "${actionName}" ${actionKind}!`);
};

export default createCustomResolver;
