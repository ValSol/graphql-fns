// @flow

import toCursor from '../../../utils/toCursor';

type Result = {
  pageInfo: {
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    startCursor?: string,
    endCursor?: string,
  },
  edges: Array<{ node: Object, cursor: string }>,
};

const composeFirstEdges = (shift: number, first: number, entities: Array<Object>): Result => {
  const coersedEntities = shift === -1 ? [{ id: '' }, ...entities] : entities;

  const { length } = coersedEntities;

  if (length === 1) {
    const pageInfo = {
      hasNextPage: false,
      hasPreviousPage: shift > -1,
    };

    return { pageInfo, edges: [] };
  }

  const startCursorShift = 1;
  const endCursorShift = length < first + 2 ? length - 1 : first;

  const pageInfo = {
    hasNextPage: length > first + 1,
    hasPreviousPage: shift !== -1,
    startCursor: toCursor(coersedEntities[startCursorShift].id, shift + startCursorShift),
    endCursor: toCursor(coersedEntities[endCursorShift].id, shift + endCursorShift),
  };

  return {
    pageInfo,
    edges: coersedEntities.reduce((prev, node, i) => {
      if (i < startCursorShift || i > endCursorShift) {
        return prev;
      }

      prev.push({
        node,
        cursor: toCursor(node.id, shift + i),
      });
      return prev;
    }, []),
  };
};

export default composeFirstEdges;
