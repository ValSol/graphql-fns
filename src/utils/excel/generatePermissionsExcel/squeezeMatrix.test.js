// @flow
/* eslint-env jest */

import squeezeMatrix from './squeezeMatrix';

describe('squeezeMatrix util', () => {
  test('should return transponsed matrix', () => {
    const m = [
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
        [2, 4],
      ],
      [
        [3, 0],
        [3, 1],
        [3, 2],
        [3, 3],
        [3, 4],
      ],
    ];
    const matrix = [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ],
      [
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
      ],
      [
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
      ],
    ];
    const column = [0, 1, 2, 3, 4];
    const row = [0, 1, 2, 3];

    const result = squeezeMatrix(m);

    expect(result).toEqual({ column, row, matrix });
  });

  test('should return squeezed matrix', () => {
    const m = [
      [[0, 0], null, [0, 2], [0, 3], [0, 4]],
      [[1, 0], null, [1, 2], [1, 3], [1, 4]],
      [null, null, null, null, null],
      [[3, 0], null, [3, 2], [3, 3], [3, 4]],
    ];

    const matrix = [
      [
        [0, 0],
        [1, 0],
        [3, 0],
      ],
      [
        [0, 2],
        [1, 2],
        [3, 2],
      ],
      [
        [0, 3],
        [1, 3],
        [3, 3],
      ],
      [
        [0, 4],
        [1, 4],
        [3, 4],
      ],
    ];
    const column = [0, 2, 3, 4];
    const row = [0, 1, 3];

    const result = squeezeMatrix(m);

    expect(result).toEqual({ column, row, matrix });
  });

  test('should return squeezed matrix 2', () => {
    const m = [
      [null, null, [0, 2], null, [0, 4]],
      [null, null, [1, 2], [1, 3], [1, 4]],
      [null, null, null, null, null],
      [[3, 0], null, [3, 2], [3, 3], [3, 4]],
    ];

    const matrix = [
      [null, null, [3, 0]],
      [
        [0, 2],
        [1, 2],
        [3, 2],
      ],
      [null, [1, 3], [3, 3]],
      [
        [0, 4],
        [1, 4],
        [3, 4],
      ],
    ];
    const column = [0, 2, 3, 4];
    const row = [0, 1, 3];

    const result = squeezeMatrix(m);

    expect(result).toEqual({ column, row, matrix });
  });

  test('should return empty matrix', () => {
    const m = [
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
    ];

    const matrix = [];
    const column = [];
    const row = [];
    const result = squeezeMatrix(m);

    expect(result).toEqual({ column, row, matrix });
  });
});
