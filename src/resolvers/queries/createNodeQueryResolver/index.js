// @flow

import type { GeneralConfig, ServersideConfig } from '../../../flowTypes';
import type { Context } from '../../flowTypes';

import executeAuthorisation from '../../utils/executeAuthorisation';
import fromGlobalId from '../../utils/fromGlobalId';
import transformAfter from '../../utils/resolverDecorator/transformAfter';

import createEntityFileQueryResolver from '../createEntityFileQueryResolver';
import createEntityQueryResolver from '../createEntityQueryResolver';

const createNodeQueryResolver = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): Function | null => {
  const { allEntityConfigs } = generalConfig;

  const resolver = async (
    parent: Object,
    args: { id: string },
    context: Context,
    info: Object,
  ): Object => {
    const { id: globalId } = args;

    const { _id: id, entityName, derivativeKey } = fromGlobalId(globalId);

    if (!id) return null;

    const entityConfig = allEntityConfigs[entityName];

    const inAnyCase = true;

    if (entityConfig.type === 'tangibleFile') {
      const inventoryChain = ['Query', `entityFile${derivativeKey}`, entityName];

      const filter = await executeAuthorisation(
        inventoryChain,
        { mainEntity: '' },
        context,
        generalConfig,
        serversideConfig,
      );

      const entityFileQueryResolver = createEntityFileQueryResolver(
        entityConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      );

      if (!entityFileQueryResolver) return null;

      const entityFile = await entityFileQueryResolver(
        null,
        { whereOne: { id } },
        context,
        info,
        filter,
      );

      return {
        ...transformAfter(entityFile, entityConfig, null),
        __typename: `${entityName}${derivativeKey}`,
      };
    }

    const inventoryChain = ['Query', `entity${derivativeKey}`, entityName];

    const filter = await executeAuthorisation(
      inventoryChain,
      { mainEntity: '' },
      context,
      generalConfig,
      serversideConfig,
    );

    const entityQueryResolver = createEntityQueryResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    );

    if (!entityQueryResolver) return null;

    const entity = await entityQueryResolver(null, { whereOne: { id } }, context, info, filter);

    return {
      ...transformAfter(entity, entityConfig, null),
      __typename: `${entityName}${derivativeKey}`,
    };
  };

  return resolver;
};

export default createNodeQueryResolver;
