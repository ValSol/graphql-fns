import mongoose from 'mongoose';

import type {
  Context,
  EntityConfig,
  GeneralConfig,
  GraphqlObject,
  NearInput,
  ServersideConfig,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntitiesThroughConnectionQueryAttributes from '../../../types/actionAttributes/childEntitiesThroughConnectionQueryAttributes';
import createChildEntitiesThroughConnectionQueryResolver from '../../queries/createChildEntitiesThroughConnectionQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';
import fromGlobalId from '../../utils/fromGlobalId';

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
  const { allEntityConfigs, inventory, descendant } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  if (!checkDescendantAction('childEntitiesThroughConnection', entityConfig, generalConfig)) {
    return null;
  }

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

  const { relationalFields = [] } = entityConfig as TangibleEntityConfig;

  const oppositeFields = relationalFields.reduce((prev, item) => {
    const {
      parent,
      name: fieldName,
      oppositeName,
      config: { name: oppositeEnityName },
    } = item;
    if (!parent) {
      prev[`${oppositeEnityName}:${oppositeName}`] = fieldName;
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

    const { entityName, descendantKey: descendantKey2 } = fromGlobalId(id);

    const whereById = {
      [oppositeFields[
        `${entityName}${descendantKey2}:${fieldName.slice(0, -'ThroughConnection'.length)}`
      ]]: id,
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
