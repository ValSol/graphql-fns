import mongoose from 'mongoose';

import type {
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
  GraphqlObject,
} from '../../../tsTypes';
import type { Context } from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesQueryResolver from '../../queries/createChildEntitiesQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import fromGlobalId from '../../utils/fromGlobalId';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityArrayResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityArrayResolver = (
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

    const id_in = parent[fieldName];

    if (!id_in?.length) return [];

    const objectIds_from_parent = id_in
      .map((id: string) => fromGlobalId(id)._id)
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const { near, search, sort, where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, { id_in }] } : { id_in };

    const entities = await childEntitiesQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityArrayResolver
      sort?.length || near || search
        ? { ...args, where: where2, token: parent._token }
        : { ...args, where: where2, token: parent._token, objectIds_from_parent },
      context,
      info,
    );

    return entities;
  };

  return resolver;
};

export default createEntityArrayResolver;
