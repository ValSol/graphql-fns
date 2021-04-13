// @flow
import mingo from 'mingo';

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import mergeWhereAndFilter from '../../mergeWhereAndFilter';
import extractExternalReferences from './extractExternalReferences';
import getExternalReferences from './getExternalReferences';
import patchExternalReferences from './patchExternalReferences';

const checkData = async (
  preData: { [key: string]: any },
  preFilter: Array<Object>,
  thingConfig: ThingConfig,
  toCreate: boolean,
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
): Promise<boolean> => {
  if (!preFilter.length) {
    return true;
  }
  const externalReferencesArgs = extractExternalReferences(
    preData,
    preFilter,
    thingConfig,
    toCreate,
  );

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
    toCreate,
  );

  const notCreateObjectId = true;
  const { where } = mergeWhereAndFilter(filter, {}, thingConfig, notCreateObjectId);

  const query = new mingo.Query(where);
  return query.test(data);
};

export default checkData;
