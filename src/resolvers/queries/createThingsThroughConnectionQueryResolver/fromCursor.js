// @flow

const fromCursor = (cursor?: string): null | { _id: string, shift: number } => {
  if (!cursor) return null; // eslint-disable-line no-underscore-dangle

  const [_id, textSkip = 0] = atob(cursor).split(':');

  const shift = parseInt(textSkip, 10);

  if (Number.isNaN(shift)) return null;

  return _id ? { _id, shift } : null;
};

export default fromCursor;
