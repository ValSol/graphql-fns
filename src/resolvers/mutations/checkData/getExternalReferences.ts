import createInfoEssence from '@/resolvers/utils/createInfoEssence';
import type { GeneralConfig, ServersideConfig } from '../../../tsTypes';
import composeQueryResolver from '../../utils/composeQueryResolver';

type ExternalReferencesArgs = Array<[string, string, any]>;

const getExternalReferences = async (
  externalReferencesArgs: ExternalReferencesArgs,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: any,
  session: any,
): Promise<Array<string | null>> => {
  const results: Array<string | null> = [];

  for (let i = 0; i < externalReferencesArgs.length; i += 1) {
    const [entityName, id, filter] = externalReferencesArgs[i];

    const instance = await composeQueryResolver(entityName, generalConfig, serversideConfig)(
      null,
      { whereOne: { id } },
      context,
      createInfoEssence({ _id: 1 }),
      { inputOutputEntity: [filter] },
      session,
    );

    if (instance) {
      results.push(id.toString());
    } else {
      results.push(null);
    }
  }

  return results;
};

export default getExternalReferences;
