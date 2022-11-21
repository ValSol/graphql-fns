// @flow

import toCursor from './toCursor';

type Result = {
  pageInfo: {
    hasNextPage: boolean,
    hasPreviousPage: boolean,
    startCursor?: string,
    endCursor?: string,
  },
  edges: Array<{ node: Object, cursor: string }>,
};

const composeFirstEdges = (shift: number, first: number, things: Array<Object>): Result => {
  const coersedThings = shift === -1 ? [{ id: '' }, ...things] : things;

  const { length } = coersedThings;

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
    startCursor: toCursor(coersedThings[startCursorShift].id, shift + startCursorShift),
    endCursor: toCursor(coersedThings[endCursorShift].id, shift + endCursorShift),
  };

  return {
    pageInfo,
    edges: coersedThings.reduce((prev, node, i) => {
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
