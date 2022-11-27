// @flow
import type { EntityConfig } from '../../../flowTypes';

import checkUnsetsFields from './checkUnsetsFields';
import mainOptimizeBulk from './mainOptimizeBulk';

const optimizeBulkItems = (
  core: Map<EntityConfig, Array<Object>>,
): Map<EntityConfig, Array<Object>> => {
  const result = new Map();

  core.forEach((bulkItems, config) => {
    const optimizedBulkItems = mainOptimizeBulk(bulkItems);
    checkUnsetsFields(optimizedBulkItems, config);

    if (optimizedBulkItems.length) {
      result.set(config, optimizedBulkItems);
    }
  });

  return result;
};

export default optimizeBulkItems;
