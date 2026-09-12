const fromGlobalId = (
  globalId: string | null,
): {
  _id: null | string;
  entityName: string;
  representationKey: string;
} => {
  if (!globalId) return { _id: null, entityName: '', representationKey: '' };

  const [_id, entityName, representationKey] = Buffer.from(globalId, 'base64')
    .toString('binary')
    .split(':');

  return _id
    ? { _id, entityName, representationKey }
    : { _id: null, entityName: '', representationKey: '' };
};

export default fromGlobalId;
