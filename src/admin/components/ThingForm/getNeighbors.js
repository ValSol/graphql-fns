// @flow

const getNeighbors = (
  id: string,
  items: Array<{ id: string, [key: string]: any }>,
): { previous?: string, next?: string } => {
  const { length } = items;
  if (length < 2) return {};

  const index = items.findIndex(({ id: id2 }) => id === id2);

  if (index === -1) return {};

  if (index === 0) return { next: items[1].id };

  if (index === length - 1) return { previous: items[length - 2].id };

  return { previous: items[index - 1].id, next: items[index + 1].id };
};

export default getNeighbors;
