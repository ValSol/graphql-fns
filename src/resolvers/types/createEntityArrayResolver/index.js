// @flow

import type { GeneralConfig, ServersideConfig, EntityConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import childEntitiesQueryAttributes from '../../../types/actionAttributes/childEntitiesQueryAttributes';
import createChildEntitiesQueryResolver from '../../queries/createChildEntitiesQueryResolver';
import executeAuthorisation from '../../utils/executeAuthorisation';
import createCustomResolver from '../../createCustomResolver';
import parseEntityName from '../../utils/parseEntityName';
import resolverDecorator from '../../utils/resolverDecorator';

type Args = { where: Object, sort: Object };

const createEntityArrayResolver = (
  entityConfig: EntityConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function => {
  const { name } = entityConfig;
  const { entityConfigs } = generalConfig;

  const { root: nameRoot, suffix: nameSuffix } = parseEntityName(name, generalConfig);

  const childEntitiesQueryResolver = nameSuffix
    ? createCustomResolver(
        'Query',
        `childEntities${nameSuffix}`,
        entityConfigs[nameRoot],
        generalConfig,
        serversideConfig,
      )
    : resolverDecorator(
        createChildEntitiesQueryResolver(entityConfig, generalConfig, serversideConfig),
        childEntitiesQueryAttributes,
        entityConfig,
        generalConfig,
      );

  if (!childEntitiesQueryResolver) {
    throw new TypeError(
      `Not defined childEntitiesQueryResolver "${
        nameSuffix ? `childEntities${nameSuffix}` : 'childEntities'
      }" for entity: "${entityConfigs[nameRoot].name}"!`,
    );
  }

  const inventoryChain = nameSuffix
    ? ['Query', `childEntities${nameSuffix}`, nameRoot]
    : ['Query', 'childEntities', name];

  const resolver = async (parent: Object, args: Args, context: Context, info: Object): Object => {
    const filter = await executeAuthorisation(inventoryChain, context, serversideConfig);

    if (!filter) {
      throw new TypeError(
        `Not authorized resolver: "${
          nameSuffix ? `childEntities${nameSuffix}` : 'childEntities'
        }" for entity: "${entityConfigs[nameRoot].name}"!`,
      );
    }

    if (!parent) {
      throw new TypeError(
        `Got undefined parent in resolver: "childEntities${
          nameSuffix || ''
        }" for entity: "${name}"!`,
      );
    }

    const { fieldName } = info;

    const id_in = parent[fieldName]; // eslint-disable-line camelcase

    if (!id_in || !id_in.length) return []; // eslint-disable-line camelcase

    const { where, sort } = args || {};

    const where2 = where ? { AND: [where, { id_in }] } : { id_in }; // eslint-disable-line camelcase

    const entities = await childEntitiesQueryResolver(
      parent,
      { ...args, where: where2 },
      context,
      info,
      filter,
    );

    if (sort) return entities;

    const entitiesObject = entities.reduce((prev, entity) => {
      prev[entity.id] = entity; // eslint-disable-line no-param-reassign
      return prev;
    }, {});

    return id_in.map((id) => entitiesObject[id]).filter(Boolean);
  };

  return resolver;
};

export default createEntityArrayResolver;
