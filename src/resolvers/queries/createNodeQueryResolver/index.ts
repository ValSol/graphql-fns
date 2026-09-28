import type {
  Context,
  GeneralConfig,
  ServersideConfig,
  GraphqlScalar,
  GraphqlObject,
  SintheticResolverInfo,
} from '../../../tsTypes';

import composeRepresentationConfig from '../../../utils/composeRepresentationConfig';
import composeQueryResolver from '../../utils/composeQueryResolver';
import { copyCalculatedContext } from '../../utils/calculatedContext';
import executeNodeAuthorisation from '../../utils/executeAuthorisation/executeNodeAuthorisation';
import fromGlobalId from '../../utils/fromGlobalId';
import transformAfter from '../../utils/resolverDecorator/transformAfter';

const createNodeQueryResolver = (
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
): any | null => {
  const { allEntityConfigs, representations } = generalConfig;

  const resolver = async (
    parent: null | GraphqlObject,
    args: { id: string },
    context: Context,
    info: SintheticResolverInfo,
  ): Promise<GraphqlObject | GraphqlObject[] | GraphqlScalar | GraphqlScalar[] | null> => {
    const { id: globalId } = args;

    const { _id: id, entityName, representationKey } = fromGlobalId(globalId);

    if (!id) return null;

    const filter = await executeNodeAuthorisation(
      `${entityName}${representationKey}`,
      context,
      generalConfig,
      serversideConfig,
    );

    if (!filter) return null;

    const entityConfig = allEntityConfigs[entityName];

    if (representationKey && !representations?.[representationKey]) {
      throw new TypeError(`Not found representationKey: "${representationKey}"!`);
    }

    const resultEntityConfig = representationKey
      ? composeRepresentationConfig(
          representations?.[representationKey],
          entityConfig,
          generalConfig,
        )
      : entityConfig;

    const entity = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
      null,
      { whereOne: { id } },
      context,
      info,
      {
        involvedFilters: { inputOutputFilterAndLimit: filter },
        // calculated fields of a representation node (with "addFields") are taken from its config
        calculatedFieldsConfig: resultEntityConfig || undefined,
      },
    );

    if (!entity) return null;

    // the spread rebuilds the entity, so the hidden context of calculated fields is passed on
    return copyCalculatedContext(entity, {
      ...transformAfter({}, entity, resultEntityConfig, generalConfig),
      __typename: `${entityName}${representationKey}`,
    });
  };

  return resolver;
};

export default createNodeQueryResolver;
