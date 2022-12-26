// @flow

import mongoose from 'mongoose';

import type { EntityConfig, GeneralConfig, NearInput, ServersideConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import checkInventory from '../../../utils/inventory/checkInventory';
import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesThroughConnectionQueryResolver from '../../queries/createChildEntitiesThroughConnectionQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import fromGlobalId from '../../utils/fromGlobalId';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput,
  search?: string,
  sort?: Object,
  where?: Object,
  // "objectIds_from_parent" arg used only to call from createEntityConnectionResolver
  objectIds_from_parent?: Array<Object>,
};

const createEntityConnectionResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = entityConfig;
  const { allEntityConfigs, inventory } = generalConfig;

  const { root: nameRoot, derivativeKey } = parseEntityName(name, generalConfig);

  const childEntitiesThroughConnectionQueryResolver = derivativeKey
    ? createCustomResolver(
        'Query',
        `childEntitiesThroughConnection${derivativeKey}`,
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
        childEntitiesQueryAttributes,
        entityConfig,
        generalConfig,
      );

  if (!childEntitiesThroughConnectionQueryResolver) {
    throw new TypeError(
      `Not defined childEntitiesThroughConnectionQueryResolver "${
        derivativeKey
          ? `childEntitiesThroughConnection${derivativeKey}`
          : 'childEntitiesThroughConnection'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = derivativeKey
    ? ['Query', `childEntitiesThroughConnection${derivativeKey}`, nameRoot]
    : ['Query', 'childEntitiesThroughConnection', name];

  if (!checkInventory(inventoryChain, inventory)) return null;

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          derivativeKey
            ? `childEntitiesThroughConnection${derivativeKey}`
            : 'childEntitiesThroughConnection'
        }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntitiesThroughConnection${
          derivativeKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[`${fieldName.slice(0, -'ThroughConnection'.length)}`]; // eslint-disable-line camelcase

    if (!id_in || !id_in.length) return []; // eslint-disable-line camelcase

    const objectIds_from_parent = id_in // eslint-disable-line no-underscore-dangle, camelcase
      .map((id) => fromGlobalId(id)._id) // eslint-disable-line no-underscore-dangle
      .map((id) => mongoose.mongo.ObjectId(id));

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
      filter,
    );

    return entitiesConniection;
  };

  return resolver;
};

export default createEntityConnectionResolver;
