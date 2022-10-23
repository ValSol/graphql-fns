// @flow

const fromGlobalId = (
  globalId: string | null,
): { _id: null } | { _id: string, thingName: string, suffix: string } => {
  if (!globalId) return { _id: null }; // eslint-disable-line no-underscore-dangle

  const [_id, thingName, suffix] = atob(globalId).split(':');

  // $FlowFixMe
  return _id ? { _id, thingName, suffix } : { id: null };
};

export default fromGlobalId;
