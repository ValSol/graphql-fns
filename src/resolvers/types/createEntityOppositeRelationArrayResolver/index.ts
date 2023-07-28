import type {
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
  GraphqlObject,
  TangibleEntityConfig,
} from '../../../tsTypes';
import type { Context } from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesQueryResolver from '../../queries/createChildEntitiesQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityOppositeRelationArrayResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityOppositeRelationArrayResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  if (!checkDescendantAction('childEntities', entityConfig, generalConfig)) {
    return null;
  }

  const childEntitiesQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntities${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntitiesQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntities', nameRoot],
        childEntitiesQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntitiesQueryResolver) {
    throw new TypeError(
      `Not defined childEntitiesQueryResolver "${
        descendantKey ? `childEntities${descendantKey}` : 'childEntities'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

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

    const whereById = { [oppositeFields[fieldName]]: id };

    const { where } = args || {};

    const where2 = where !== undefined ? { AND: [where, whereById] } : whereById; // eslint-disable-line camelcase

    const entities = await childEntitiesQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityOppositeRelationArrayResolver
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entities;
  };

  return resolver;
};

export default createEntityOppositeRelationArrayResolver;
