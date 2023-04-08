import type { DataObject, EntityConfig } from '../../../tsTypes';
import type { Core } from '../../tsTypes';

import checkUnsetsFields from './checkUnsetsFields';
import mainOptimizeBulk from './mainOptimizeBulk';

const optimizeBulkItems = (core: Core): Core => {
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
