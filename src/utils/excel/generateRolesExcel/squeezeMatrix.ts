import transpose from './transpose';

type Matrix = Array<Array<any>>;

const squeezeMatrix = (m: Matrix): {
  column: Array<number>,
  row: Array<number>,
  matrix: Matrix
} => {
  const matrix2 = m.filter((row) => !row.every((item) => item === null));
  const row = matrix2.map((arr) => arr.filter(Boolean)[0][0]);

  if (!matrix2.length) return { column: [], row: [], matrix: [] };

  const matrix3 = transpose(matrix2);
  const matrix = matrix3.filter((row2) => !row2.every((item) => item === null));
  const column = matrix.map((arr) => arr.filter(Boolean)[0][1]);
  return { column, row, matrix };
};

export default squeezeMatrix;
