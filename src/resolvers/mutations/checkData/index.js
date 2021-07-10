// @flow
import mingo from 'mingo';

import type { GeneralConfig, ServersideConfig, ThingConfig } from '../../../flowTypes';
import mergeWhereAndFilter from '../../utils/mergeWhereAndFilter';
import extractExternalReferences from './extractExternalReferences';
import extractMissingAndPushDataFields from './extractMissingAndPushDataFields';
import extractMissingDataFields from './extractMissingDataFields';
import getExternalReferences from './getExternalReferences';
import getMissingData from './getMissingData';
import patchExternalReferences from './patchExternalReferences';

const checkData = async (
  args: Object,
  preFilter: Array<Object>,
  thingConfig: ThingConfig,
  processingKind: 'create' | 'update' | 'push',
  generalConfig: GeneralConfig,
  serversideConfig: ServersideConfig,
  context: Object,
): Promise<boolean> => {
  if (!preFilter.length) {
    return true;
  }

  const { data: preData } = args;

  let preData2 = preData;
  if (processingKind === 'update') {
    const projection = extractMissingDataFields(preData, preFilter);
    if (Object.keys(projection).length) {
      preData2 = await getMissingData({
        args: { ...args, data: preData },
        processingKind,
        projection,
        thingConfig,
        generalConfig,
        serversideConfig,
        context,
      });

      if (!preData2) return false;
    }
  } else if (processingKind === 'push') {
    const projection = extractMissingAndPushDataFields(preData, preFilter, thingConfig);
    if (Object.keys(projection).length) {
      preData2 = await getMissingData({
        args: { ...args, data: preData },
        processingKind,
        projection,
        thingConfig,
        generalConfig,
        serversideConfig,
        context,
      });

      if (!preData2) return false;
    }
  }

  const externalReferencesArgs = extractExternalReferences(preData2, preFilter, thingConfig);

  const externalReferences = await getExternalReferences(
    externalReferencesArgs,
    generalConfig,
    serversideConfig,
    context,
  );

  const { data, filter } = patchExternalReferences(
    externalReferences,
    preData2,
    preFilter,
    thingConfig,
  );

  const notCreateObjectId = true;
  const { where } = mergeWhereAndFilter(filter, {}, thingConfig, notCreateObjectId);

  const query = new mingo.Query(where);
  return query.test(data);
};

export default checkData;
