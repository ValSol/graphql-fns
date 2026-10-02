import type { EntityConfig } from '../../../../tsTypes';

import whereFromGlobalIds from '../../whereFromGlobalIds';

type WhereAndSearch = { where?: any; search?: string };

const processItem = (item: WhereAndSearch, entityConfig: EntityConfig): WhereAndSearch =>
  item.where ? { ...item, where: whereFromGlobalIds(item.where, entityConfig) } : item;

// only "where" of every item has global ids, "search" is kept as is
const transformWhereAndSearch = (
  whereAndSearch: WhereAndSearch | WhereAndSearch[],
  entityConfig: EntityConfig,
): WhereAndSearch | WhereAndSearch[] => {
  if (Array.isArray(whereAndSearch)) {
    return whereAndSearch.map((item) => processItem(item, entityConfig));
  }

  return processItem(whereAndSearch, entityConfig);
};

export default transformWhereAndSearch;
