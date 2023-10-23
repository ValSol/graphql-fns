const fromGlobalId = (
  globalId: string | null,
): {
  _id: null | string;
  entityName: string;
  descendantKey: string;
} => {
  if (!globalId) return { _id: null, entityName: '', descendantKey: '' }; // eslint-disable-line no-underscore-dangle

  const [_id, entityName, descendantKey] = Buffer.from(globalId, 'base64')
    .toString('binary')
    .split(':');

  return _id
    ? { _id, entityName, descendantKey }
    : { _id: null, entityName: '', descendantKey: '' };
};

export default fromGlobalId;
