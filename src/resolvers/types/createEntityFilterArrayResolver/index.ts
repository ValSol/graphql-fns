import type {
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
  GraphqlObject,
} from '../../../tsTypes';
import type { Context } from '../../../tsTypes';

import checkRepresentationAction from '../../../utils/checkRepresentationAction';
import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesQueryResolver from '../../queries/createChildEntitiesQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';
import whereToGlobalIds from '../../utils/whereToGlobalIds';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityFilterArrayResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityFilterArrayResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, representationKey } = parseEntityName(name, generalConfig);

  if (!checkRepresentationAction('childEntities', entityConfig, generalConfig)) {
    return null;
  }

  const childEntitiesQueryResolver = representationKey
    ? createCustomResolver(
        'Query',
        `childEntities${representationKey}`,
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
        representationKey ? `childEntities${representationKey}` : 'childEntities'
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
          representationKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const stringifiedFilter = parent[fieldName];

    if (!stringifiedFilter) return [];

    // all "mongo ids" in filter have to be represented like "globalIds" to be transformed back to "mongo ids" by resolverDecorator
    const filter = whereToGlobalIds(JSON.parse(stringifiedFilter), entityConfig, representationKey);

    const { where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, filter] } : filter;

    const entities = await childEntitiesQueryResolver(
      parent,
      // objectIds_from_parent use only for call from this createEntityFilterArrayResolver
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entities;
  };

  return resolver;
};

export default createEntityFilterArrayResolver;
