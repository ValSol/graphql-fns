import mongoose from 'mongoose';

import type {
  Context,
  EntityConfig,
  GeneralConfig,
  GraphqlObject,
  InventoryСhain,
  NearInput,
  ServersideConfig,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import childEntitiesThroughConnectionQueryAttributes from '../../../types/actionAttributes/childEntitiesThroughConnectionQueryAttributes';
import createChildEntitiesThroughConnectionQueryResolver from '../../queries/createChildEntitiesThroughConnectionQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityOppositeRelationConnectionResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityOppositeRelationConnectionResolver = (
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
        childEntitiesThroughConnectionQueryAttributes,
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

  const { relationalFields = [] } = entityConfig as TangibleEntityConfig;

  const oppositeFields = relationalFields.reduce((prev, item) => {
    const { parent, name: fieldName, oppositeName } = item;
    if (!parent) {
      prev[oppositeName] = fieldName;
    }

    return prev;
  }, {});

  if (Object.keys(oppositeFields).length === 0) {
    throw new TypeError(`Not found parent relational fields in entityConfig: "${name}"!`);
  }

  const resolver = async (
    parent: any,
    args: Args,
    context: Context,
    info: any,
  ): Promise<GraphqlObject[]> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntities${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const { id } = parent;

    const whereById = {
      [oppositeFields[`${fieldName.slice(0, -'ThroughConnection'.length)}`]]: id,
    };

    const { where } = args || {};

    const where2 = where !== undefined ? { AND: [where, whereById] } : whereById; // eslint-disable-line camelcase

    const entities = await childEntitiesThroughConnectionQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityOppositeRelationConnectionResolver
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entities;
  };

  return resolver;
};

export default createEntityOppositeRelationConnectionResolver;
