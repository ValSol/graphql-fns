import type {
  Context,
  EntityConfig,
  GeneralConfig,
  NearInput,
  ServersideConfig,
} from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntityDistinctValuesQueryAttributes from '../../../types/actionAttributes/childEntityDistinctValuesQueryAttributes';
import createChildEntityDistinctValuesQueryResolver from '../../queries/createChildEntityDistinctValuesQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  near?: NearInput;
  search?: string;
  sort?: any;
  where?: any;
  // "objectIds_from_parent" arg used only to call from createEntityDistinctValuesResolver
  objectIds_from_parent?: Array<any>;
};

const createEntityDistinctValuesResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  if (!checkDescendantAction('childEntityDistinctValues', entityConfig, generalConfig)) {
    return null;
  }

  const childEntityDistinctValuesQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntityDistinctValues${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityDistinctValuesQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntityDistinctValues', nameRoot],
        childEntityDistinctValuesQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntityDistinctValuesQueryResolver) {
    throw new TypeError(
      `Not defined childEntityDistinctValuesQueryResolver "${
        descendantKey ? `childEntityDistinctValues${descendantKey}` : 'childEntityDistinctValues'
      }" for entity: "${allEntityConfigs[nameRoot].name}"!`,
    );
  }

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntityDistinctValues${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[`${fieldName.slice(0, -'DistinctValues'.length)}`]; // eslint-disable-line camelcase

    // eslint-disable-next-line camelcase
    if (!id_in || !id_in.length) return [];

    const { where = {} } = args;

    const where2 = Object.keys(where).length > 0 ? { AND: [where, { id_in }] } : { id_in }; // eslint-disable-line camelcase

    const entityDistinctValues = await childEntityDistinctValuesQueryResolver(
      parent,
      { ...args, where: where2, token: parent._token },
      context,
      info,
    );

    return entityDistinctValues;
  };

  return resolver;
};

export default createEntityDistinctValuesResolver;
