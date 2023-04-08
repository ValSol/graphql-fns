/* eslint-env jest */

import type { Context } from '../../../tsTypes';

import fieldArrayThroughConnectionResolver from './index';
import { toCursor } from './fromToCursor';

describe('fieldArrayThroughConnectionResolver', () => {
  const parent = {
    title: 'Paris',
    files: [
      { id: '0' },
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
      { id: '7' },
      { id: '8' },
      { id: '9' },
      { id: '10' },
    ],
  };

  const info = { fieldName: 'filesThroughConnection' };

  test('should return for after: "2", first: 4', async () => {
    const args = { after: toCursor(2), first: 4 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: toCursor(3),
        endCursor: toCursor(6),
      },
      edges: [
        { node: { id: '3' }, cursor: toCursor(3) },
        { node: { id: '4' }, cursor: toCursor(4) },
        { node: { id: '5' }, cursor: toCursor(5) },
        { node: { id: '6' }, cursor: toCursor(6) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for after: "8", first: 2', async () => {
    const args = { after: toCursor(8), first: 2 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: toCursor(9),
        endCursor: toCursor(10),
      },
      edges: [
        { node: { id: '9' }, cursor: toCursor(9) },
        { node: { id: '10' }, cursor: toCursor(10) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for after: "8", first: 4', async () => {
    const args = { after: toCursor(8), first: 4 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: toCursor(9),
        endCursor: toCursor(10),
      },
      edges: [
        { node: { id: '9' }, cursor: toCursor(9) },
        { node: { id: '10' }, cursor: toCursor(10) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for first: 4', async () => {
    const args = { first: 4 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: toCursor(0),
        endCursor: toCursor(3),
      },
      edges: [
        { node: { id: '0' }, cursor: toCursor(0) },
        { node: { id: '1' }, cursor: toCursor(1) },
        { node: { id: '2' }, cursor: toCursor(2) },
        { node: { id: '3' }, cursor: toCursor(3) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for first: 12', async () => {
    const args = { first: 12 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor(0),
        endCursor: toCursor(10),
      },
      edges: [
        { node: { id: '0' }, cursor: toCursor(0) },
        { node: { id: '1' }, cursor: toCursor(1) },
        { node: { id: '2' }, cursor: toCursor(2) },
        { node: { id: '3' }, cursor: toCursor(3) },
        { node: { id: '4' }, cursor: toCursor(4) },
        { node: { id: '5' }, cursor: toCursor(5) },
        { node: { id: '6' }, cursor: toCursor(6) },
        { node: { id: '7' }, cursor: toCursor(7) },
        { node: { id: '8' }, cursor: toCursor(8) },
        { node: { id: '9' }, cursor: toCursor(9) },
        { node: { id: '10' }, cursor: toCursor(10) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for before: "4", last: 2', async () => {
    const args = { before: toCursor(4), last: 2 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: toCursor(2),
        endCursor: toCursor(3),
      },
      edges: [
        { node: { id: '2' }, cursor: toCursor(2) },
        { node: { id: '3' }, cursor: toCursor(3) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for before: "4", last: 4', async () => {
    const args = { before: toCursor(4), last: 4 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: toCursor(0),
        endCursor: toCursor(3),
      },
      edges: [
        { node: { id: '0' }, cursor: toCursor(0) },
        { node: { id: '1' }, cursor: toCursor(1) },
        { node: { id: '2' }, cursor: toCursor(2) },
        { node: { id: '3' }, cursor: toCursor(3) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for before: "4", last: 6', async () => {
    const args = { before: toCursor(4), last: 6 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: toCursor(0),
        endCursor: toCursor(3),
      },
      edges: [
        { node: { id: '0' }, cursor: toCursor(0) },
        { node: { id: '1' }, cursor: toCursor(1) },
        { node: { id: '2' }, cursor: toCursor(2) },
        { node: { id: '3' }, cursor: toCursor(3) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for last: 4', async () => {
    const args = { last: 4 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        startCursor: toCursor(7),
        endCursor: toCursor(10),
      },
      edges: [
        { node: { id: '7' }, cursor: toCursor(7) },
        { node: { id: '8' }, cursor: toCursor(8) },
        { node: { id: '9' }, cursor: toCursor(9) },
        { node: { id: '10' }, cursor: toCursor(10) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });

  test('should return for last: 12', async () => {
    const args = { last: 12 };

    const result = await fieldArrayThroughConnectionResolver(
      parent,
      args,
      { mongooseConn: {}, pubsub: {} } as Context,
      info,
    );

    const expectedResult = {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: toCursor(0),
        endCursor: toCursor(10),
      },
      edges: [
        { node: { id: '0' }, cursor: toCursor(0) },
        { node: { id: '1' }, cursor: toCursor(1) },
        { node: { id: '2' }, cursor: toCursor(2) },
        { node: { id: '3' }, cursor: toCursor(3) },
        { node: { id: '4' }, cursor: toCursor(4) },
        { node: { id: '5' }, cursor: toCursor(5) },
        { node: { id: '6' }, cursor: toCursor(6) },
        { node: { id: '7' }, cursor: toCursor(7) },
        { node: { id: '8' }, cursor: toCursor(8) },
        { node: { id: '9' }, cursor: toCursor(9) },
        { node: { id: '10' }, cursor: toCursor(10) },
      ],
    };

    expect(result).toEqual(expectedResult);
  });
});
