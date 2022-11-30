// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import childEntityQueryAttributes from '../../../types/actionAttributes/childEntityQueryAttributes';
import createChildEntityQueryResolver from '../../queries/createChildEntityQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = { where: { id: string } };

const createEntityScalarResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = entityConfig;
  const { entityConfigs } = generalConfig;

  const { root: nameRoot, suffix: nameSuffix } = parseEntityName(name, generalConfig);

  const childEntityQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `childEntity${nameSuffix}`,
        entityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntityQueryResolver(entityConfig, generalConfig, serversideConfig),
        childEntityQueryAttributes,
        entityConfig,
      );

  if (!childEntityQueryResolver) {
    throw new TypeError(
      `Not defined childEntityQueryResolver "${
        nameSuffix ? `childEntity${nameSuffix}` : 'childEntity'
      }" for entity: "${entityConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = nameSuffix
    ? ['Query', `childEntity${nameSuffix}`, nameRoot]
    : ['Query', 'childEntity', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          nameSuffix ? `childEntity${nameSuffix}` : 'childEntity'
        }" for entity: "${entityConfigs[nameRoot].name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntity${nameSuffix || ''}" for entity: "${name}"!`,
      );
    }
    const { fieldName } = info;

    const id = parent[fieldName]; // eslint-disable-line camelcase

    const whereOne = { id };

    return childEntityQueryResolver(parent, { ...args, whereOne }, context, info, filter);
  };

  return resolver;
};

export default createEntityScalarResolver;
