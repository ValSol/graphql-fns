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

const composeLastEdges = (shift: number, last: number, things: Array<Object>): Result => {
  const { length } = things;

  if (length === 1) {
    const pageInfo = {
      hasNextPage: true,
      hasPreviousPage: false,
    };

    return { pageInfo, edges: [] };
  }

  const startCursorShift = length < last + 2 ? 0 : 1;
  const endCursorShift = length < last + 2 ? length - 2 : last;

  const shift2 = length < last + 2 ? shift - length + 1 : shift - last - 1;

  const pageInfo = {
    hasNextPage: true,
    hasPreviousPage: length > last + 1,
    startCursor: toCursor(things[startCursorShift].id, shift2 + startCursorShift),
    endCursor: toCursor(things[endCursorShift].id, shift2 + endCursorShift),
  };

  return {
    pageInfo,
    edges: things.reduce((prev, node, i) => {
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
