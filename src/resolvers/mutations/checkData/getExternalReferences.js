// @flow
import type { GeneralConfig, ServersideConfig } from '../../../flowTypes';
import createThingQueryResolver from '../../queries/createThingQueryResolver';

type ExternalReferencesArgs = Array<[string, string, Object]>;

const getExternalReferences = async (
  externalReferencesArgs: ExternalReferencesArgs,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
): Promise<Array<string | null>> => {
  const { thingConfigs } = generalConfig;
  const inAnyCase = true;
  const thingQueryResolvers = {};

  const results = [];

  for (let i = 0; i < externalReferencesArgs.length; i += 1) {
    const [thingName, id, filter] = externalReferencesArgs[i];

    if (!thingQueryResolvers[thingName]) {
      thingQueryResolvers[thingName] = createThingQueryResolver(
        thingConfigs[thingName],
        generalConfig,
        serversideConfig,
        inAnyCase,
      );
    }

    // eslint-disable-next-line no-await-in-loop
    const thing = await thingQueryResolvers[thingName](
      null,
      { whereOne: { id } },
      context,
      { projection: { _id: 1 } },
      filter,
    );

    if (thing) {
      results.push(id);
    } else {
      results.push(null);
    }
  }

  return results;
};

export default getExternalReferences;
