export type KeysetSortKey = [fieldName: string, direction: 1 | -1];

// the keys that define the order of a connection: the keys after "id" are dropped (ids are unique),
// so "id" ends the keys ("addIdTieBreaker" adds it to every sort a keyset connection uses)
const composeKeysetSortKeys = (sortBy: string[]): KeysetSortKey[] => {
  const keys: KeysetSortKey[] = [];

  for (const sortKey of sortBy) {
    const [preFieldName, direction] = sortKey.split('_');

    const fieldName = preFieldName === 'id' ? '_id' : preFieldName;

    if (direction === 'ASC') {
      keys.push([fieldName, 1]);
    } else if (direction === 'DESC') {
      keys.push([fieldName, -1]);
    } else {
      throw new TypeError(`Incorrect sort key: "${sortKey}"!`);
    }

    if (fieldName === '_id') return keys;
  }

  throw new TypeError(`Sort keys "${sortBy.join(', ')}" have to contain "id" key!`);
};

export default composeKeysetSortKeys;
