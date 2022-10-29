// @flow

import fromGlobalId from '../../fromGlobalId';

const processWhereOne = ({ id: globalId, ...rest }) => {
  if (!globalId) return { id: globalId, ...rest };

  const { _id: id } = fromGlobalId(globalId);

  return { ...rest, ...{ id } };
};

const transformWhereOne = (whereOne: Object): Object => {
  if (Array.isArray(whereOne)) {
    return whereOne.map(processWhereOne);
  }

  return processWhereOne(whereOne);
};

export default transformWhereOne;
