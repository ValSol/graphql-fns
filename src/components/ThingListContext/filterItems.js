// @flow

import type { AdminFilters } from '../../flowTypes';

const filterItems = (
  items: Array<Object>,
  decorated: Array<Object>,
  filters: AdminFilters,
): Array<Object> => {
  const result = decorated.reduce((prev, item, i) => {
    const satisfy = Object.keys(filters).every(key => {
      const { fieldVariant, value } = filters[key];
      if (value === 'all') return true;
      if (fieldVariant === 'booleanField') {
        return value === item[key];
      }
      // $FlowFixMe
      if (!value.count()) return !item[key].count();

      // $FlowFixMe
      return value.and(item[key]).count();
    });
    if (satisfy) prev.push(items[i]);
    return prev;
  }, []);

  return result;
};

export default filterItems;
