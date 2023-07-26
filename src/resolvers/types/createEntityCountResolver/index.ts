import mongoose from 'mongoose';

import type {
  Context,
  EntityConfig,
  GeneralConfig,
  InventoryСhain,
  NearInput,
  ServersideConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import childEntityCountQueryAttributes from '../../../types/actionAttributes/childEntityCountQueryAttributes';
import createChildEntityCountQueryResolver from '../../queries/createChildEntityCountQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import fromGlobalId from '../../utils/fromGlobalId';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityCountResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityCountResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs, inventory } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  const childEntityCountQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntityCount${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityCountQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntityCount', nameRoot],
        childEntityCountQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntityCountQueryResolver) {
    throw new TypeError(
      `Not defined childEntityCountQueryResolver "${
        descendantKey ? `childEntityCount${descendantKey}` : 'childEntityCount'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain: InventoryСhain = descendantKey
    ? ['Query', `childEntityCount${descendantKey}`, nameRoot]
    : ['Query', 'childEntityCount', name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntityCount${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[`${fieldName.slice(0, -'Count'.length)}`]; // eslint-disable-line camelcase

    // eslint-disable-next-line camelcase
    if (!id_in || !id_in.length) return 0;

    const { where } = args || {};

    const where2 = where ? { AND: [where, { id_in }] } : { id_in }; // eslint-disable-line camelcase

    const entitiesConniection = await childEntityCountQueryResolver(
      parent,
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entitiesConniection;
  };

  return resolver;
};

export default createEntityCountResolver;
