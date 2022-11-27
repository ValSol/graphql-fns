// @flow

const fromGlobalId = (
  globalId: string | null,
): { _id: null | string, entityName: string, suffix: string } => {
  if (!globalId) return { _id: null, entityName: '', suffix: '' }; // eslint-disable-line no-underscore-dangle

  const [_id, entityName, suffix] = atob(globalId).split(':');

  // $FlowFixMe
  return _id ? { _id, entityName, suffix } : { id: null, entityName: '', suffix: '' };
};

export default fromGlobalId;
