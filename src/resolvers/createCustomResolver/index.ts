import type {
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  ThreeSegmentInventoryChain,
} from '@/tsTypes';

import checkInventory from '../../utils/inventory/checkInventory';
import mergeRepresentationIntoCustom from '../../utils/mergeRepresentationIntoCustom';
import composeCustomActionSignature from '../../types/composeCustomActionSignature';
import customResolverDecorator from '../utils/resolverDecorator/customResolverDecorator';
import generateRepresentationResolvers from './generateRepresentationResolvers';

const createCustomResolver = (
  actionKind: 'Query' | 'Mutation',
  actionName: string,
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): null | any => {
  const { name } = entityConfig;

  const { inventory } = generalConfig;

  const custom = mergeRepresentationIntoCustom(generalConfig, 'forCustomResolver');

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

  // use generated representation resolvers

  const representationResolvers = generateRepresentationResolvers(generalConfig);

  if (!representationResolvers) {
    throw new TypeError(`Have to set the custom "${actionName}" ${actionKind}!`);
  }

  if (representationResolvers[actionKind]?.[actionName]) {
    return customResolverDecorator(
      representationResolvers[actionKind][actionName](
        entityConfig,
        generalConfig,
        serversideConfig,
      ),
      inventoryChain,
      signatureMethods,
      entityConfig,
      generalConfig,
      serversideConfig,
    );
  }

  throw new TypeError(
    `Have to set the representation or custom "${actionName}" ${actionKind} for "${entityConfig.name}" entity!`,
  );
};

export default createCustomResolver;
