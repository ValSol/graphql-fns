// @flow
/* eslint-env jest */

import toCursor from '../../../utils/toCursor';

import composeFirstEdges from './composeFirstEdges';

describe('composeFirstEdges', () => {
  const entities = [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];
  const shift = 10;

  test('return empty result', () => {
    const emptyEntities = [{ id: 0 }];
    const first = 3;

    const result = composeFirstEdges(shift, first, emptyEntities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
      },

      edges: [],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for first = 3', () => {
    const first = 3;

    const result = composeFirstEdges(shift, first, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: toCursor('1', 11),
        endCursor: toCursor('3', 13),
      },

      edges: [
        { node: { id: '1' }, cursor: toCursor('1', 11) },
        { node: { id: '2' }, cursor: toCursor('2', 12) },
        { node: { id: '3' }, cursor: toCursor('3', 13) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for first = 4', () => {
    const first = 4;

    const result = composeFirstEdges(shift, first, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: toCursor('1', 11),
        endCursor: toCursor('4', 14),
      },

      edges: [
        { node: { id: '1' }, cursor: toCursor('1', 11) },
        { node: { id: '2' }, cursor: toCursor('2', 12) },
        { node: { id: '3' }, cursor: toCursor('3', 13) },
        { node: { id: '4' }, cursor: toCursor('4', 14) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for first = 5', () => {
    const first = 5;

    const result = composeFirstEdges(shift, first, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: toCursor('1', 11),
        endCursor: toCursor('4', 14),
      },

      edges: [
        { node: { id: '1' }, cursor: toCursor('1', 11) },
        { node: { id: '2' }, cursor: toCursor('2', 12) },
        { node: { id: '3' }, cursor: toCursor('3', 13) },
        { node: { id: '4' }, cursor: toCursor('4', 14) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for shift = -1 first = 4', () => {
    const first = 4;
    const shift2 = -1;
    const result = composeFirstEdges(shift2, first, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: toCursor('0', 0),
        endCursor: toCursor('3', 3),
      },

      edges: [
        { node: { id: '0' }, cursor: toCursor('0', 0) },
        { node: { id: '1' }, cursor: toCursor('1', 1) },
        { node: { id: '2' }, cursor: toCursor('2', 2) },
        { node: { id: '3' }, cursor: toCursor('3', 3) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for shift = -1 first = 5', () => {
    const first = 5;
    const shift2 = -1;
    const result = composeFirstEdges(shift2, first, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor('0', 0),
        endCursor: toCursor('4', 4),
      },

      edges: [
        { node: { id: '0' }, cursor: toCursor('0', 0) },
        { node: { id: '1' }, cursor: toCursor('1', 1) },
        { node: { id: '2' }, cursor: toCursor('2', 2) },
        { node: { id: '3' }, cursor: toCursor('3', 3) },
        { node: { id: '4' }, cursor: toCursor('4', 4) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for shift = -1 first = 6', () => {
    const first = 6;
    const shift2 = -1;
    const result = composeFirstEdges(shift2, first, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor('0', 0),
        endCursor: toCursor('4', 4),
      },

      edges: [
        { node: { id: '0' }, cursor: toCursor('0', 0) },
        { node: { id: '1' }, cursor: toCursor('1', 1) },
        { node: { id: '2' }, cursor: toCursor('2', 2) },
        { node: { id: '3' }, cursor: toCursor('3', 3) },
        { node: { id: '4' }, cursor: toCursor('4', 4) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for shift = -1 first = 3 entities.length = 0', () => {
    const first = 3;
    const shift2 = -1;
    const result = composeFirstEdges(shift2, first, []);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },

      edges: [],
    };

    expect(result).toEqual(expectedResult);
  });
});
