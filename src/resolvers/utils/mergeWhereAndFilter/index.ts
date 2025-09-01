import type { EntityConfig, GraphqlObject, PipelineMongoDB } from '@/tsTypes';

import addFilter from './addFilter';
import composeWhereInput from './composeWhereInput';

const mergeWhereAndFilter = (
  filter: Array<GraphqlObject>,
  where: any,
  entityConfig: EntityConfig,
  notCreateObjectId?: boolean,
): {
  where: any;
  lookups: PipelineMongoDB;
} => composeWhereInput(addFilter(filter, where), entityConfig, notCreateObjectId);

export default mergeWhereAndFilter;
