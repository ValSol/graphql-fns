import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  GraphqlScalar,
  GraphqlObject,
  SintheticResolverInfo,
} from '../../../tsTypes';

import composeDerivativeConfig from '../../../utils/composeDerivativeConfig';
import executeNodeAuthorisation from '../../utils/executeAuthorisation/executeNodeAuthorisation';
import fromGlobalId from '../../utils/fromGlobalId';
import transformAfter from '../../utils/resolverDecorator/transformAfter';

import createEntityFileQueryResolver from '../createEntityFileQueryResolver';
import createEntityQueryResolver from '../createEntityQueryResolver';

const createNodeQueryResolver = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any | null => {
  const { allEntityConfigs, derivative } = generalConfig;

  const resolver = async (
    parent: null | GraphqlObject,
    args: { id: string },
    context: Context,
    info: SintheticResolverInfo,
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { id: globalId } = args;

    const { _id: id, entityName, derivativeKey } = fromGlobalId(globalId);

    if (!id) return null;

    const filter = await executeNodeAuthorisation(
      `${entityName}${derivativeKey}`,
      context,
      serversideConfig,
    );

    if (!filter) return null;

    const entityConfig = allEntityConfigs[entityName];

    if (derivativeKey && !derivative?.[derivativeKey]) {
      throw new TypeError(`Not found derivativeKey: "${derivativeKey}"!`);
    }

    const resultEntityConfig = derivativeKey
      ? // $FlowFixMe
        composeDerivativeConfig(derivative?.[derivativeKey], entityConfig, generalConfig)
      : entityConfig;

    const inAnyCase = true;

    if (entityConfig.type === 'tangibleFile') {
      const entityFileQueryResolver = createEntityFileQueryResolver(
        entityConfig,
        generalConfig,
        serversideConfig,
        inAnyCase,
      );

      if (!entityFileQueryResolver) return null;

      const entityFile = await entityFileQueryResolver(null, { whereOne: { id } }, context, info, {
        inputOutputEntity: filter,
      });

      if (!entityFile) return null;

      return {
        ...transformAfter(entityFile, entityConfig, null),
        __typename: `${entityName}${derivativeKey}`,
      };
    }

    const entityQueryResolver = createEntityQueryResolver(
      entityConfig,
      generalConfig,
      serversideConfig,
      inAnyCase,
    );

    if (!entityQueryResolver) return null;

    const entity = await entityQueryResolver(null, { whereOne: { id } }, context, info, {
      inputOutputEntity: filter,
    });

    if (!entity) return null;

    return {
      ...transformAfter(entity, resultEntityConfig, generalConfig),
      __typename: `${entityName}${derivativeKey}`,
    };
  };

  return resolver;
};

export default createNodeQueryResolver;
