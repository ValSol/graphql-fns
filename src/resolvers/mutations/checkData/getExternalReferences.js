// @flow
import type { GeneralConfig, ServersideConfig } from '../../../flowTypes';
import createEntityQueryResolver from '../../queries/createEntityQueryResolver';

type ExternalReferencesArgs = Array<[string, string, Object]>;

const getExternalReferences = async (
  externalReferencesArgs: ExternalReferencesArgs,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
): Promise<Array<string | null>> => {
  const { allEntityConfigs } = generalConfig;
  const inAnyCase = true;
  const entityQueryResolvers = {};

  const results = [];

  for (let i = 0; i < externalReferencesArgs.length; i += 1) {
    const [entityName, id, filter] = externalReferencesArgs[i];

    if (!entityQueryResolvers[entityName]) {
      entityQueryResolvers[entityName] = createEntityQueryResolver(
        allEntityConfigs[entityName],
        generalConfig,
        serversideConfig,
        inAnyCase,
      );
    }

    // eslint-disable-next-line no-await-in-loop
    const entity = await entityQueryResolvers[entityName](
      null,
      { whereOne: { id } },
      context,
      { projection: { _id: 1 } },
      { foo: filter },
    );

    if (entity) {
      results.push(id);
    } else {
      results.push(null);
    }
  }

  return results;
};

export default getExternalReferences;
