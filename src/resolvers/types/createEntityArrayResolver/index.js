// @flow

import mongoose from 'mongoose';

import type { EntityConfig, GeneralConfig, NearInput, ServersideConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesQueryResolver from '../../queries/createChildEntitiesQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import fromGlobalId from '../../utils/fromGlobalId';
import parseEntityName from '../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput,
  search?: string,
  sort?: Object,
  where?: Object,
  // "objectIds_from_parent" arg used only to call from createEntityArrayResolver
  objectIds_from_parent?: Array<Object>,
};

const createEntityArrayResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = entityConfig;
  const { allEntityConfigs, inventory } = generalConfig;

  const { root: nameRoot, derivativeKey } = parseEntityName(name, generalConfig);

  const childEntitiesQueryResolver = derivativeKey
    ? createCustomResolver(
        'Query',
        `childEntities${derivativeKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntitiesQueryResolver(entityConfig, generalConfig, serversideConfig),
        childEntitiesQueryAttributes,
        entityConfig,
        generalConfig,
      );

  if (!childEntitiesQueryResolver) {
    throw new TypeError(
      `Not defined childEntitiesQueryResolver "${
        derivativeKey ? `childEntities${derivativeKey}` : 'childEntities'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = derivativeKey
    ? ['Query', `childEntities${derivativeKey}`, nameRoot]
    : ['Query', 'childEntities', name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          derivativeKey ? `childEntities${derivativeKey}` : 'childEntities'
        }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntities${
          derivativeKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[fieldName]; // eslint-disable-line camelcase

    if (!id_in?.length) return []; // eslint-disable-line camelcase

    const objectIds_from_parent = id_in // eslint-disable-line no-underscore-dangle, camelcase
      .map((id) => fromGlobalId(id)._id) // eslint-disable-line no-underscore-dangle
      .map((id) => mongoose.mongo.ObjectId(id));

    const { near, search, sort, where } = args || {};

    const where2 = where ? { AND: [where, { id_in }] } : { id_in }; // eslint-disable-line camelcase

    const entities = await childEntitiesQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityArrayResolver
      sort?.length || near || search
        ? { ...args, where: where2 }
        : { ...args, where: where2, objectIds_from_parent },
      context,
      info,
      filter,
    );

    return entities;
  };

  return resolver;
};

export default createEntityArrayResolver;
