import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntityGetOrCreateQueryAttributes from '../../../types/actionAttributes/childEntityGetOrCreateQueryAttributes';
import createChildEntityGetOrCreateQueryResolver from '../../queries/createChildEntityGetOrCreateQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  where: {
    id: string;
  };
  data: GraphqlObject;
};

const createEntityGetOrCreateResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  if (!checkDescendantAction('childEntityGetOrCreate', entityConfig, generalConfig)) {
    return null;
  }

  const childEntityGetOrCreateQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntityGetOrCreate${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityGetOrCreateQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntityGetOrCreate', nameRoot],
        childEntityGetOrCreateQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntityGetOrCreateQueryResolver) {
    throw new TypeError(
      `Not defined childEntityGetOrCreateQueryResolver "${
        descendantKey ? `childEntityGetOrCreate${descendantKey}` : 'childEntityGetOrCreate'
      }" for entity: "${name}"!`,
    );
  }

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntityGetOrCreate${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const tangibleFieldName = `${fieldName.slice(0, -'GetOrCreate'.length)}`;

    const id = parent[tangibleFieldName]; // eslint-disable-line camelcase

    if (id) {
      const whereOne = { id } as const;

      return childEntityGetOrCreateQueryResolver(
        parent,
        { ...args, whereOne, token: parent._token },
        context,
        info,
      );
    }

    const connect = parent.id;

    const { name: name2 } = (entityConfig as TangibleEntityConfig).duplexFields.find(
      ({ oppositeName }) => oppositeName === tangibleFieldName,
    );

    const data = { ...args.data, [name2]: { connect } };

    return childEntityGetOrCreateQueryResolver(
      parent,
      { ...args, data, token: parent._token },
      context,
      info,
    );
  };

  return resolver;
};

export default createEntityGetOrCreateResolver;
