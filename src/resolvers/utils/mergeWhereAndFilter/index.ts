import type { EntityConfig, GraphqlObject, LookupMongoDB } from '@/tsTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Array<GraphqlObject>,
  where: any,
  entityConfig: EntityConfig,
  options: { forRestrictedWhere?: boolean; notCreateObjectId?: boolean } = {},
): {
  where: any;
  lookups: LookupMongoDB[];
} => composeWhereInput(addFilter(filter, where), entityConfig, options);

export default mergeWhereAndFilter;
