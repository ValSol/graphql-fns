const fromCursor = (
  cursor?: string,
): null | {
  _id: string;
  shift: number;
} => {
  if (!cursor) return null;

  const [_id, textSkip = '0'] = Buffer.from(cursor, 'base64').toString('binary').split(':');

  const shift = parseInt(textSkip, 10);

  if (Number.isNaN(shift)) return null;

  return _id ? { _id, shift } : null;
};

export default fromCursor;
