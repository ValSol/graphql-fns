import { ObjectId } from 'mongodb';

import type {
  Context,
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
} from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntitiesThroughConnectionQueryAttributes from '../../../types/actionAttributes/childEntitiesThroughConnectionQueryAttributes';
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
  const { allEntityConfigs } = generalConfig;

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

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntitiesThroughConnection${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[`${fieldName.slice(0, -'ThroughConnection'.length)}`];

    if (!id_in || !id_in.length)
      return {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        edges: [],
      };

    const objectIds_from_parent = id_in
      .map((id: string) => fromGlobalId(id)._id)
      .map((id: string) => new ObjectId(id));

    const { near, search, sort, where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, { id_in }] } : { id_in };

    const entitiesConniection = await childEntitiesThroughConnectionQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityConnectionResolver
      sort?.length || near || search
        ? { ...args, where: where2, token: parent._token }
        : { ...args, where: where2, token: parent._token, objectIds_from_parent },
      context,
      info,
    );

    return entitiesConniection;
  };

  return resolver;
};

export default createEntityConnectionResolver;
