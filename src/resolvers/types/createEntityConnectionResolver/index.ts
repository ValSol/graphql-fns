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
import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesThroughConnectionQueryResolver from '../../queries/createChildEntitiesThroughConnectionQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import fromGlobalId from '../../utils/fromGlobalId';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityConnectionResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityConnectionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs, inventory } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  const childEntitiesThroughConnectionQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntitiesThroughConnection${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntitiesThroughConnectionQueryResolver(
          entityConfig,
          generalConfig,
          serversideConfig,
        ),
        ['Query', 'childEntitiesThroughConnection', nameRoot],
        childEntitiesQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntitiesThroughConnectionQueryResolver) {
    throw new TypeError(
      `Not defined childEntitiesThroughConnectionQueryResolver "${
        descendantKey
          ? `childEntitiesThroughConnection${descendantKey}`
          : 'childEntitiesThroughConnection'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain: InventoryСhain = descendantKey
    ? ['Query', `childEntitiesThroughConnection${descendantKey}`, nameRoot]
    : ['Query', 'childEntitiesThroughConnection', name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntitiesThroughConnection${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[`${fieldName.slice(0, -'ThroughConnection'.length)}`]; // eslint-disable-line camelcase

    if (!id_in || !id_in.length) return []; // eslint-disable-line camelcase

    const objectIds_from_parent = id_in // eslint-disable-line no-underscore-dangle, camelcase
      .map((id) => fromGlobalId(id)._id) // eslint-disable-line no-underscore-dangle
      .map((id) => new mongoose.mongo.ObjectId(id));

    const { near, search, sort, where } = args || {};

    const where2 = where ? { AND: [where, { id_in }] } : { id_in }; // eslint-disable-line camelcase

    const entitiesConniection = await childEntitiesThroughConnectionQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityConnectionResolver
      sort?.length || near || search
        ? { ...args, where: where2 }
        : { ...args, where: where2, objectIds_from_parent },
      context,
      info,
    );

    return entitiesConniection;
  };

  return resolver;
};

export default createEntityConnectionResolver;
