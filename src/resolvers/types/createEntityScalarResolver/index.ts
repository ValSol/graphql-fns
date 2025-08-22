import type { Context, GeneralConfig, ServersideConfig, EntityConfig } from '../../../tsTypes';

import checkDescendantAction from '../../../utils/checkDescendantAction';
import childEntityQueryAttributes from '../../../types/actionAttributes/childEntityQueryAttributes';
import createChildEntityQueryResolver from '../../queries/createChildEntityQueryResolver';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = {
  where: {
    id: string;
  };
};

const createEntityScalarResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any => {
  const { name } = entityConfig;
  const { allEntityConfigs } = generalConfig;

  const { root: nameRoot, descendantKey } = parseEntityName(name, generalConfig);

  if (!checkDescendantAction('childEntity', entityConfig, generalConfig)) {
    return null;
  }

  const childEntityQueryResolver = descendantKey
    ? createCustomResolver(
        'Query',
        `childEntity${descendantKey}`,
        allEntityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityQueryResolver(entityConfig, generalConfig, serversideConfig),
        ['Query', 'childEntity', nameRoot],
        childEntityQueryAttributes,
        entityConfig,
        generalConfig,
        serversideConfig,
      );

  if (!childEntityQueryResolver) {
    throw new TypeError(
      `Not defined childEntityQueryResolver "${
        descendantKey ? `childEntity${descendantKey}` : 'childEntity'
      }" for entity: "${name}"!`,
    );
  }

  const resolver = async (parent: any, args: Args, context: Context, info: any): Promise<any> => {
    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntity${
          descendantKey || ''
        }" for entity: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const id = parent[fieldName];

    if (!id) {
      return null;
    }

    const whereOne = { id } as const;

    return childEntityQueryResolver(
      parent,
      { ...args, whereOne, token: parent._token },
      context,
      info,
    );
  };

  return resolver;
};

export default createEntityScalarResolver;
