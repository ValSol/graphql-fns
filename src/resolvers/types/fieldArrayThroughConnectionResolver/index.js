// @flow
import type { Context } from '../../flowTypes';

import { fromCursor, toCursor } from './fromToCursor';

type Args = { after?: string, before?: string, first?: number, last?: number };

type PageInfo = {
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  startCursor?: string,
  endCursor?: string,
};

const composeEdges = (arr, shift) => arr.map((node, i) => ({ node, cursor: toCursor(i + shift) }));

const composeConnection = (shift, count, wholeArray) => {
  const arr = wholeArray.slice(shift, shift + count);

  const edges = composeEdges(arr, shift);

  const pageInfo: PageInfo = {
    hasNextPage: shift + count < wholeArray.length,
    hasPreviousPage: shift > 0,
  };

  if (arr.length) {
    Object.assign(pageInfo, {
      startCursor: toCursor(shift),
      endCursor: toCursor(shift + arr.length - 1),
    });
  }

  return { pageInfo, edges };
};

const fieldArrayThroughConnectionResolver = (
  parent: Object,
  args: Args,
  context: Context,
  info: Object,
): Object => {
  const { fieldName } = info;

  const wholeArray = parent[`${fieldName.slice(0, -'ThroughConnection'.length)}`];

  if (!wholeArray.length) {
    return { pageInfo: { hasNextPage: false, hasPreviousPage: false }, edges: [] };
  }

  const { after, before, first, last } = args;

  if (after) {
    if (typeof first === 'undefined') {
      throw new TypeError(
        `For "after" arg ("${after}", field: "${fieldName}ThroughConnection") not found "first" arg!`,
      );
    }

    const shift = fromCursor(after) + 1;

    return composeConnection(shift, first, wholeArray);
  }

  if (first) {
    return composeConnection(0, first, wholeArray);
  }

  if (before) {
    if (typeof last === 'undefined') {
      throw new TypeError(
        `For "before" arg ("${before}", field: "${fieldName}ThroughConnection") not found "last" arg!`,
      );
    }

    const shift = Math.max(0, fromCursor(before) - last);

    const count = shift ? last : fromCursor(before);

    return composeConnection(shift, count, wholeArray);
  }

  if (last) {
    const shift = Math.max(0, wholeArray.length - last);

    return composeConnection(shift, last, wholeArray);
  }

  throw new TypeError(`Incorrect set of args in field: "${fieldName}ThroughConnection"!`);
};

export default fieldArrayThroughConnectionResolver;
