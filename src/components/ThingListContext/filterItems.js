// @flow
import BitwiseArray from 'bitwise-array';

import type { AdminFilters } from '../../flowTypes';

const filterItems = (
  items: Array<Object>,
  decorated: Array<Object>,
  filters: AdminFilters,
): Array<Object> => {
  const result = decorated.reduce((prev, item, i) => {
    const satisfy = Object.keys(filters).every((key) => {
      const { fieldVariant, value } = filters[key];
      if (value === 'all') return true;
      if (fieldVariant === 'booleanField') {
        return value === item[key];
      }

      if (!(value instanceof BitwiseArray)) {
        // only to eliminate flowjs errors
        throw new TypeError('Have to be BitwiseArray!');
      }

      if (!value.count()) return !item[key].count();

      return value.and(item[key]).count();
    });
    if (satisfy) prev.push(items[i]);
    return prev;
  }, []);

  return result;
};

export default filterItems;
