import parseSortKey from '../parseSortKey';

export type KeysetSortKey = [fieldName: string, direction: 1 | -1];

// the keys that define the order of a connection: the keys after "id" are dropped (ids are unique),
// so "id" ends the keys ("addIdTieBreaker" adds it to every sort a keyset connection uses)
const composeKeysetSortKeys = (sortBy: string[]): KeysetSortKey[] => {
  const keys: KeysetSortKey[] = [];

  for (const sortKey of sortBy) {
    const key = parseSortKey(sortKey);

    keys.push(key);

    const [fieldName] = key;

    if (fieldName === '_id') return keys;
  }

  throw new TypeError(`Sort keys "${sortBy.join(', ')}" have to contain "id" key!`);
};

export default composeKeysetSortKeys;
