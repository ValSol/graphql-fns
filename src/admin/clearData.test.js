// @flow
/* eslint-env jest */

import clearData from './clearData';

describe('clearData', () => {
  test('should remove "__typename" fields from object', () => {
    const data = {
      a: 'a',
      b: 'b',
      __typename: 'Example',
      embedded1A: {
        a: 'a',
        b: 'b',
        __typename: 'Embedded1',
        embedded2A: {
          a: 'a',
          b: 'b',
          __typename: 'Embedded2',
          embedded3A: {
            a: 'a',
            b: 'b',
            __typename: 'Embedded3',
          },
        },
        embedded2B: {
          a: 'a',
          b: 'b',
          __typename: 'Embedded2',
        },
      },
    };

    const expectedResult = {
      a: 'a',
      b: 'b',
      embedded1A: {
        a: 'a',
        b: 'b',
        embedded2A: {
          a: 'a',
          b: 'b',
          embedded3A: {
            a: 'a',
            b: 'b',
          },
        },
        embedded2B: {
          a: 'a',
          b: 'b',
        },
      },
    };

    const result = clearData(data);
    expect(result).toEqual(expectedResult);
  });

  test('should remove "__typename" fields from object', () => {
    const data = {
      a: 'a',
      b: 'b',
      __typename: 'Example',
      embedded1A: [
        {
          a: 'a',
          b: 'b',
          __typename: 'Embedded1',
          embedded2A: {
            a: 'a',
            b: 'b',
            __typename: 'Embedded2',
            embedded3A: [
              {
                a: 'a',
                b: 'b',
                __typename: 'Embedded3',
              },
              {
                a: 'c',
                b: 'd',
                __typename: 'Embedded3',
              },
            ],
          },
          embedded2B: {
            a: 'a',
            b: 'b',
            __typename: 'Embedded2',
          },
        },
        {
          c: 'c',
          d: 'd',
          __typename: 'Embedded1',
          embedded2A: {
            a: 'a',
            b: 'b',
            __typename: 'Embedded2',
            embedded3A: [
              {
                a: 'a',
                b: 'b',
                __typename: 'Embedded3',
              },
              {
                c: 'c',
                d: 'd',
                __typename: 'Embedded3',
              },
            ],
          },
          embedded2B: {
            a: 'a',
            b: 'b',
            __typename: 'Embedded2',
          },
        },
      ],
    };

    const expectedResult = {
      a: 'a',
      b: 'b',
      embedded1A: [
        {
          a: 'a',
          b: 'b',
          embedded2A: {
            a: 'a',
            b: 'b',
            embedded3A: [
              {
                a: 'a',
                b: 'b',
              },
              {
                a: 'c',
                b: 'd',
              },
            ],
          },
          embedded2B: {
            a: 'a',
            b: 'b',
          },
        },
        {
          c: 'c',
          d: 'd',
          embedded2A: {
            a: 'a',
            b: 'b',
            embedded3A: [
              {
                a: 'a',
                b: 'b',
              },
              {
                c: 'c',
                d: 'd',
              },
            ],
          },
          embedded2B: {
            a: 'a',
            b: 'b',
          },
        },
      ],
    };

    const result = clearData(data);
    expect(result).toEqual(expectedResult);
  });
});
