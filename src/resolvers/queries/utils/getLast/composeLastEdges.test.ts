/* eslint-env jest */

import toCursor from '../../../utils/toCursor';

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

  test('return result for last = 5, shift -11', () => {
    const last = 4;
    const shift2 = -11;

    const result = composeLastEdges(shift2, last, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: toCursor('7', 7),
        endCursor: toCursor('10', 10),
      },

      edges: [
        { node: { id: '7' }, cursor: toCursor('7', 7) },
        { node: { id: '8' }, cursor: toCursor('8', 8) },
        { node: { id: '9' }, cursor: toCursor('9', 9) },
        { node: { id: '10' }, cursor: toCursor('10', 10) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for last = 5, shift -5', () => {
    const last = 5;
    const shift2 = -5;

    const result = composeLastEdges(shift2, last, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor('6', 0),
        endCursor: toCursor('10', 4),
      },

      edges: [
        { node: { id: '6' }, cursor: toCursor('6', 0) },
        { node: { id: '7' }, cursor: toCursor('7', 1) },
        { node: { id: '8' }, cursor: toCursor('8', 2) },
        { node: { id: '9' }, cursor: toCursor('9', 3) },
        { node: { id: '10' }, cursor: toCursor('10', 4) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for last = 6, shift -5', () => {
    const last = 6;
    const shift2 = -5;

    const result = composeLastEdges(shift2, last, entities);

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor('6', 0),
        endCursor: toCursor('10', 4),
      },

      edges: [
        { node: { id: '6' }, cursor: toCursor('6', 0) },
        { node: { id: '7' }, cursor: toCursor('7', 1) },
        { node: { id: '8' }, cursor: toCursor('8', 2) },
        { node: { id: '9' }, cursor: toCursor('9', 3) },
        { node: { id: '10' }, cursor: toCursor('10', 4) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('return result for last = 6, shift 0', () => {
    const last = 6;
    const shift2 = 0;
    const entities2: Array<any> = [];

    const result = composeLastEdges(shift2, last, entities2);

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
