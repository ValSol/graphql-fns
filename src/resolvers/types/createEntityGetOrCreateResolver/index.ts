import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  EntityConfig,
  GraphqlObject,
  TangibleEntityConfig,
} from '../../../tsTypes';

import checkRepresentationAction from '../../../utils/checkRepresentationAction';
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

  const { root: nameRoot, representationKey } = parseEntityName(name, generalConfig);

  if (!checkRepresentationAction('childEntityGetOrCreate', entityConfig, generalConfig)) {
    return null;
  }

  const childEntityGetOrCreateQueryResolver = representationKey
    ? createCustomResolver(
        'Query',
        `childEntityGetOrCreate${representationKey}`,
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
        representationKey ? `childEntityGetOrCreate${representationKey}` : 'childEntityGetOrCreate'
      }" for entity: "${name}"!`,
    );
  }

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntityGetOrCreate${
          representationKey || ''
        }" for entity: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const tangibleFieldName = `${fieldName.slice(0, -'GetOrCreate'.length)}`;

    const id = parent[tangibleFieldName];

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
