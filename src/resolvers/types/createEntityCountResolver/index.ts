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

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityCountResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityCountResolver = (
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

    const id_in = parent[`${fieldName.slice(0, -'Count'.length)}`];

    if (!id_in || !id_in.length) return 0;

    const { where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, { id_in }] } : { id_in };

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

export default createEntityCountResolver;
