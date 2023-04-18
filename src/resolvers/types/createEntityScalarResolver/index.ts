import type {
  Context,
  GeneralConfig,
  InventoryСhain,
  ServersideConfig,
  EntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import childEntityQueryAttributes from '../../../types/actionAttributes/childEntityQueryAttributes';
import createChildEntityQueryResolver from '../../queries/createChildEntityQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  where: {
    id: string;
  };
};

const createEntityScalarResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs, inventory } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  const childEntityQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntity${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntity', nameRoot],
        childEntityQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntityQueryResolver) {
    throw new TypeError(
      `Not defined childEntityQueryResolver "${
        descendantKey ? `childEntity${descendantKey}` : 'childEntity'
      }" for entity: "${name}"!`,
    );
  }

  const inventoryChain: InventoryСhain = descendantKey
    ? ['Query', `childEntity${descendantKey}`, nameRoot]
    : ['Query', 'childEntity', name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntity${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const id = parent[fieldName]; // eslint-disable-line camelcase

    const whereOne = { id } as const;

    return childEntityQueryResolver(parent, { ...args, whereOne }, context, info);
  };

  return resolver;
};

export default createEntityScalarResolver;
