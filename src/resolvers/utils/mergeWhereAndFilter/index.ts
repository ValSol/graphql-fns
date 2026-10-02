import type { EntityConfig, GraphqlObject, PipelineMongoDB } from '@/tsTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Array<GraphqlObject>,
  where: any,
  entityConfig: EntityConfig,
  options: { forRestrictedWhere?: boolean; notCreateObjectId?: boolean } = {},
): {
  where: any;
  lookups: PipelineMongoDB;
} => composeWhereInput(addFilter(filter, where), entityConfig, options);

export default mergeWhereAndFilter;
