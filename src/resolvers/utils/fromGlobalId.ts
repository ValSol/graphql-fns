const fromGlobalId = (
  globalId: string | null,
): {
  _id: null | string;
  entityName: string;
  derivativeKey: string;
} => {
  if (!globalId) return { _id: null, entityName: '', derivativeKey: '' }; // eslint-disable-line no-underscore-dangle

  const [_id, entityName, derivativeKey] = Buffer.from(globalId, 'base64')
    .toString('binary')
    .split(':');

  return _id
    ? { _id, entityName, derivativeKey }
    : { _id: null, entityName: '', derivativeKey: '' };
};

export default fromGlobalId;
