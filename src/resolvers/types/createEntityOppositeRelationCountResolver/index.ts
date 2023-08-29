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
import childEntityCountQueryAttributes from '../../../types/actionAttributes/childEntityCountQueryAttributes';
import createChildEntityCountQueryResolver from '../../queries/createChildEntityCountQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityOppositeRelationCountResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityOppositeRelationCountResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  if (!checkDescendantAction('childEntityCount', entityConfig, generalConfig)) {
    return null;
  }

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
        `Got undefined parent in resolver: "childEntityCount${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const { id } = parent;

    const whereById = { [oppositeFields[fieldName.slice(0, -'Count'.length)]]: id };

    const { where } = args || {};

    const where2 = where !== undefined ? { AND: [where, whereById] } : whereById; // eslint-disable-line camelcase

    const entities = await childEntityCountQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityOppositeRelationCountResolver
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entities;
  };

  return resolver;
};

export default createEntityOppositeRelationCountResolver;
