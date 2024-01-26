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
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';
import whereToGlobalIds from '../../utils/whereToGlobalIds';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityFilterConnectionResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityFilterConnectionResolver = (
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

    const stringifiedFilter = parent[`${fieldName.slice(0, -'ThroughConnection'.length)}`]; // eslint-disable-line camelcase

    // eslint-disable-next-line camelcase
    if (!stringifiedFilter)
      return {
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
        edges: [],
      };

    // all "mongo ids" in filter have to be represented like "globalIds" to be transformed back to "mongo ids" by resolverDecorator
    const filter = whereToGlobalIds(JSON.parse(stringifiedFilter), entityConfig, descendantKey);

    const { where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, filter] } : filter; // eslint-disable-line camelcase

    const entitiesConniection = await childEntitiesThroughConnectionQueryResolver(
      parent,
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entitiesConniection;
  };

  return resolver;
};

export default createEntityFilterConnectionResolver;
