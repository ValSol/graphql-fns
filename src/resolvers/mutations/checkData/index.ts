import mingo from 'mingo';

import type { ResolverCreatorArg, ResolverArg } from '@/tsTypes';
import mergeWhereAndFilter from '@/resolvers/utils/mergeWhereAndFilter';
import extractExternalReferences from './extractExternalReferences';
import extractMissingAndPushDataFields from './extractMissingAndPushDataFields';
import extractMissingDataFields from './extractMissingDataFields';
import getExternalReferences from './getExternalReferences';
import getMissingData from './getMissingData';
import patchExternalReferences from './patchExternalReferences';

const checkData = async (
  resolverCreatorArg: ResolverCreatorArg,
  resolverArg: ResolverArg,
  preFilter: Array<any>,
  processingKind: 'create' | 'update' | 'push',
  session: any,
): Promise<boolean> => {
  const id = `[${`${Math.random()}`.slice(2, 5)}]`;

  if (preFilter.length === 0) {
    return true;
  }

  const { entityConfig, generalConfig, serversideConfig } =
    resolverCreatorArg as ResolverCreatorArg;

  const { context } = resolverArg;

  const args = resolverArg.args as {
    whereOne: any;
    data: {
      [fieldName: string]: any;
    };
    positions?: {
      [fieldName: string]: Array<number>;
    };
  };

  const { data: preData } = args as { data: any; whereOne: any };

  let preData2 = preData;
  if (processingKind === 'update') {
    const projection = extractMissingDataFields(preData, preFilter);
    if (Object.keys(projection).length > 0) {
      preData2 = await getMissingData({
        args: { ...args, data: preData },
        processingKind,
        projection,
        entityConfig,
        generalConfig,
        serversideConfig,
        context,
        session,
      });

      if (!preData2) return false;
    }
  } else if (processingKind === 'push') {
    const projection = extractMissingAndPushDataFields(preData, preFilter, entityConfig);
    if (Object.keys(projection).length > 0) {
      preData2 = await getMissingData({
        args: { ...args, data: preData },
        processingKind,
        projection,
        entityConfig,
        generalConfig,
        serversideConfig,
        context,
        session,
      });

      if (!preData2) return false;
    }
  }

  const externalReferencesArgs = extractExternalReferences(preData2, preFilter, entityConfig);

  const externalReferences = await getExternalReferences(
    externalReferencesArgs,
    generalConfig,
    serversideConfig,
    context,
    session,
  );

  const { data, filter } = patchExternalReferences(
    externalReferences,
    preData2,
    preFilter,
    entityConfig,
  );

  const notCreateObjectId = true;

  const { where } = mergeWhereAndFilter(filter, {}, entityConfig, notCreateObjectId);

  const query = new mingo.Query(where);

  const result = query.test(data);

  return result;
};

export default checkData;
