import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  GraphqlScalar,
  GraphqlObject,
  SintheticResolverInfo,
} from '../../../tsTypes';

import composeDescendantConfig from '../../../utils/composeDescendantConfig';
import executeNodeAuthorisation from '../../utils/executeAuthorisation/executeNodeAuthorisation';
import fromGlobalId from '../../utils/fromGlobalId';
import transformAfter from '../../utils/resolverDecorator/transformAfter';

import createEntityFileQueryResolver from '../createEntityFileQueryResolver';
import createEntityQueryResolver from '../createEntityQueryResolver';

const createNodeQueryResolver = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any | null => {
  const { allEntityConfigs, descendant } = generalConfig;

  const resolver = async (
    parent: null | GraphqlObject,
    args: { id: string },
    context: Context,
    info: SintheticResolverInfo,
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { id: globalId } = args;

    const { _id: id, entityName, descendantKey } = fromGlobalId(globalId);

    if (!id) return null;

    const filter = await executeNodeAuthorisation(
      `${entityName}${descendantKey}`,
      context,
      generalConfig,
      serversideConfig,
    );

    if (!filter) return null;

    const entityConfig = allEntityConfigs[entityName];

    if (descendantKey && !descendant?.[descendantKey]) {
      throw new TypeError(`Not found descendantKey: "${descendantKey}"!`);
    }

    const resultEntityConfig = descendantKey
      ? composeDescendantConfig(descendant?.[descendantKey], entityConfig, generalConfig)
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
        ...transformAfter({}, entityFile, entityConfig, null),
        __typename: `${entityName}${descendantKey}`,
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
      ...transformAfter({}, entity, resultEntityConfig, generalConfig),
      __typename: `${entityName}${descendantKey}`,
    };
  };

  return resolver;
};

export default createNodeQueryResolver;
