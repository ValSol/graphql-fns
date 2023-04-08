import toCursor from '../../../utils/toCursor';

type Result = {
  pageInfo: {
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    startCursor?: string,
    endCursor?: string
  },
  edges: Array<{
    node: any,
    cursor: string
  }>
};

const composeLastEdges = (shift: number, last: number, entities: Array<any>): Result => {
  const { coersedEntities, coersedShift } =
    shift > 0
      ? { coersedEntities: entities, coersedShift: shift }
      : { coersedEntities: [...entities, { id: '' }], coersedShift: -shift };

  const { length } = coersedEntities;

  if (length === 1) {
    const pageInfo = {
      hasNextPage: shift > 0,
      hasPreviousPage: false,
    } as const;

    return { pageInfo, edges: [] };
  }

  const startCursorShift = length < last + 2 ? 0 : 1;
  const endCursorShift = length < last + 2 ? length - 2 : last;

  const shift2 = length < last + 2 ? coersedShift - length + 1 : coersedShift - last - 1;

  const pageInfo = {
    hasNextPage: shift > 0,
    hasPreviousPage: length > last + 1,
    startCursor: toCursor(coersedEntities[startCursorShift].id, shift2 + startCursorShift),
    endCursor: toCursor(coersedEntities[endCursorShift].id, shift2 + endCursorShift),
  } as const;

  return {
    pageInfo,
    edges: coersedEntities.reduce<Array<any>>((prev, node, i) => {
      if (i < startCursorShift || i > endCursorShift) {
        return prev;
      }

      prev.push({
        node,
        cursor: toCursor(node.id, shift2 + i),
      });
      return prev;
    }, []),
  };
};

export default composeLastEdges;
