import type { GeneralConfig, ServersideConfig } from '../../../tsTypes';
import createEntityQueryResolver from '../../queries/createEntityQueryResolver';

type ExternalReferencesArgs = Array<[string, string, any]>;

const getExternalReferences = async (
  externalReferencesArgs: ExternalReferencesArgs,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: any,
): Promise<Array<string | null>> => {
  const { allEntityConfigs } = generalConfig;
  const inAnyCase = true;
  const entityQueryResolvers: Record<string, any> = {};

  const results: Array<string | null> = [];

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

    const entity = await entityQueryResolvers[entityName](
      null,
      { whereOne: { id } },
      context,
      { projection: { _id: 1 } },
      { inputOutputEntity: [filter] },
    );

    if (entity) {
      results.push(id.toString());
    } else {
      results.push(null);
    }
  }

  return results;
};

export default getExternalReferences;
