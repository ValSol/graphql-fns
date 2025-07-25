import type {
  Context,
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
} from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntityCountQueryAttributes from '../../../types/actionAttributes/childEntityCountQueryAttributes';
import createChildEntityCountQueryResolver from '../../queries/createChildEntityCountQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';
import whereToGlobalIds from '../../utils/whereToGlobalIds';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityFilterCountResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityFilterCountResolver = (
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

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntityCount${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const stringifiedFilter = parent[`${fieldName.slice(0, -'Count'.length)}`];

    if (!stringifiedFilter) return 0;

    // all "mongo ids" in filter have to be represented like "globalIds" to be transformed back to "mongo ids" by resolverDecorator
    const filter = whereToGlobalIds(JSON.parse(stringifiedFilter), entityConfig, descendantKey);

    const { where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, filter] } : filter;

    const entityCount = await childEntityCountQueryResolver(
      parent,
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entityCount;
  };

  return resolver;
};

export default createEntityFilterCountResolver;
