import type { GraphqlObject, TangibleEntityConfig } from '../../../../tsTypes';
import type { PrepareBulkData } from '../../../tsTypes';

import processCreateInputData from '../../processCreateInputData';

const prepareBulkData: PrepareBulkData = async (
  resolverCreatorArg,
  resolverArg,
  prevPreparedData,
) => {
  const { entityConfig } = resolverCreatorArg;
  const { args } = resolverArg;

  const { data } = args as { data: GraphqlObject[] };

  let preparedData = prevPreparedData;

  data.forEach((dataItem) => {
    preparedData = processCreateInputData(
      dataItem,
      preparedData,
      entityConfig as TangibleEntityConfig,
      'create',
    );
  });

  return preparedData;
};

export default prepareBulkData;
