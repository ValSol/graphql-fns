// @flow

const fromGlobalId = (
  globalId: string | null,
): { _id: null | string, entityName: string, derivativeKey: string } => {
  if (!globalId) return { _id: null, entityName: '', derivativeKey: '' }; // eslint-disable-line no-underscore-dangle

  const [_id, entityName, derivativeKey] = atob(globalId).split(':');

  // $FlowFixMe
  return _id ? { _id, entityName, derivativeKey } : { id: null, entityName: '', derivativeKey: '' };
};

export default fromGlobalId;
