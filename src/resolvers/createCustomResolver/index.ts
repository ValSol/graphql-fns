import type {
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  ThreeSegmentInventoryChain,
} from '../../tsTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import mergeDescendantIntoCustom from '../../utils/mergeDescendantIntoCustom';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import customResolverDecorator from '../utils/resolverDecorator/customResolverDecorator';
import generateDescendantResolvers from './generateDescendantResolvers';

const createCustomResolver = (
  actionKind: 'Query' | 'Mutation',
  actionName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | any => {
  const { name } = entityConfig;

  const { inventory } = generalConfig;

  const custom = mergeDescendantIntoCustom(generalConfig, 'forCustomResolver');

  if (!custom) {
    throw new TypeError('"custom" property have to be defined!');
  }
  const { [actionKind]: customActionFolder } = custom;
  if (!customActionFolder) {
    throw new TypeError(`"${actionKind}" property have to be defined!`);
  }
  const { [actionName]: signatureMethods } = customActionFolder;

  if (!signatureMethods) {
    throw new TypeError(
      `Got undefiend signatureMethods for "${actionName}" actionName in "${name}" entity!!`,
    );
  }

  if (!composeCustomActionSignature(signatureMethods, entityConfig, generalConfig)) return null;

  const inventoryChain: ThreeSegmentInventoryChain = [actionKind, actionName, name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  if (serversideConfig[actionKind]?.[actionName]) {
    return customResolverDecorator(
      serversideConfig[actionKind][actionName](entityConfig, generalConfig, serversideConfig),
      inventoryChain,
      signatureMethods,
      entityConfig,
      generalConfig,
      serversideConfig,
    );
  }

  // use generated descendant resolvers

  const descendantResolvers = generateDescendantResolvers(generalConfig);

  if (!descendantResolvers) {
    throw new TypeError(`Have to set the custom "${actionName}" ${actionKind}!`);
  }

  if (descendantResolvers[actionKind]?.[actionName]) {
    return customResolverDecorator(
      descendantResolvers[actionKind][actionName](entityConfig, generalConfig, serversideConfig),
      inventoryChain,
      signatureMethods,
      entityConfig,
      generalConfig,
      serversideConfig,
    );
  }

  throw new TypeError(`Have to set the descendant or custom "${actionName}" ${actionKind}!`);
};

export default createCustomResolver;
