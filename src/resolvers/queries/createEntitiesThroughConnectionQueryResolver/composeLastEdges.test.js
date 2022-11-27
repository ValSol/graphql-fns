// @flow
/* eslint-env jest */

import toCursor from './toCursor';

import composeLastEdges from './composeLastEdges';

describe('composeLastEdges', () => {
  const entities = [{ id: '6' }, { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }];
  const shift = 10;

  test('return empty result', () => {
    const emptyEntities = [{ id: 0 }];
    const last = 3;

    const result = composeLastEdges(shift, last, emptyEntities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
      },

      edges: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for last = 3', () => {
    const last = 3;

    const result = composeLastEdges(shift, last, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: toCursor('7', 7),
        endCursor: toCursor('9', 9),
      },

      edges: [
        { node: { id: '7' }, cursor: toCursor('7', 7) },
        { node: { id: '8' }, cursor: toCursor('8', 8) },
        { node: { id: '9' }, cursor: toCursor('9', 9) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for last = 4', () => {
    const last = 4;

    const result = composeLastEdges(shift, last, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: toCursor('6', 6),
        endCursor: toCursor('9', 9),
      },

      edges: [
        { node: { id: '6' }, cursor: toCursor('6', 6) },
        { node: { id: '7' }, cursor: toCursor('7', 7) },
        { node: { id: '8' }, cursor: toCursor('8', 8) },
        { node: { id: '9' }, cursor: toCursor('9', 9) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for last = 5', () => {
    const last = 5;

    const result = composeLastEdges(shift, last, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: toCursor('6', 6),
        endCursor: toCursor('9', 9),
      },

      edges: [
        { node: { id: '6' }, cursor: toCursor('6', 6) },
        { node: { id: '7' }, cursor: toCursor('7', 7) },
        { node: { id: '8' }, cursor: toCursor('8', 8) },
        { node: { id: '9' }, cursor: toCursor('9', 9) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
