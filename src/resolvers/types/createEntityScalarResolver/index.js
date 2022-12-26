// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import childEntityQueryAttributes from '../../../types/actionAttributes/childEntityQueryAttributes';
import createChildEntityQueryResolver from '../../queries/createChildEntityQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = { where: { id: string } };

const createEntityScalarResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = entityConfig;
  const { allEntityConfigs, inventory } = generalConfig;

  const { root: nameRoot, derivativeKey } = parseEntityName(name, generalConfig);

  const childEntityQueryResolver = derivativeKey
    ? createCustomResolver(
        'Query',
        `childEntity${derivativeKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityQueryResolver(entityConfig, generalConfig, serversideConfig),
        childEntityQueryAttributes,
        entityConfig,
        generalConfig,
      );

  if (!childEntityQueryResolver) {
    throw new TypeError(
      `Not defined childEntityQueryResolver "${
        derivativeKey ? `childEntity${derivativeKey}` : 'childEntity'
      }" for entity: "${name}"!`,
    );
  }

  const inventoryChain = derivativeKey
    ? ['Query', `childEntity${derivativeKey}`, nameRoot]
    : ['Query', 'childEntity', name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          derivativeKey ? `childEntity${derivativeKey}` : 'childEntity'
        }" for entity: "${name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntity${
          derivativeKey || ''
        }" for entity: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const id = parent[fieldName]; // eslint-disable-line camelcase

    const whereOne = { id };

    return childEntityQueryResolver(parent, { ...args, whereOne }, context, info, filter);
  };

  return resolver;
};

export default createEntityScalarResolver;
