// @flow

type Matrix = Array<Array<any>>;

const transpose = (m: Matrix): Matrix => m[0].map((x, i) => m.map((y) => y[i]));

export default transpose;
