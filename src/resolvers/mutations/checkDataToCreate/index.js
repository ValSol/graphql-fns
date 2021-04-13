// @flow
import mingo from 'mingo';

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import mergeWhereAndFilter from '../../mergeWhereAndFilter';
import extractExternalReferences from './extractExternalReferences';
import getExternalReferences from './getExternalReferences';
import patchExternalReferences from './patchExternalReferences';

const checkDataToCreate = async (
  preData: { [key: string]: any },
  preFilter: Array<Object>,
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
): Promise<boolean> => {
  if (!preFilter.length) {
    return true;
  }
  const externalReferencesArgs = extractExternalReferences(preData, preFilter, thingConfig);

  const externalReferences = await getExternalReferences(
    externalReferencesArgs,
    generalConfig,
    serversideConfig,
    context,
  );

  const { data, filter } = patchExternalReferences(
    externalReferences,
    preData,
    preFilter,
    thingConfig,
  );

  const notCreateObjectId = true;
  const { where } = mergeWhereAndFilter(filter, {}, thingConfig, notCreateObjectId);

  const query = new mingo.Query(where);
  return query.test(data);
};

export default checkDataToCreate;
