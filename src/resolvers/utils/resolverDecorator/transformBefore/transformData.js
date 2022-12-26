// @flow

import fromGlobalId from '../../fromGlobalId';

const processData = (data) =>
  Object.keys(data).reduce((prev, key) => {
    if (key === 'id') {
      const { _id: id } = fromGlobalId(data.id);

      prev.id = id; // eslint-disable-line no-param-reassign
    } else if (data[key]?.connect) {
      if (Array.isArray(data[key].connect)) {
        const connect = data[key].connect.map((globalId) => fromGlobalId(globalId)._id); // eslint-disable-line no-param-reassign, no-underscore-dangle

        prev[key] = { connect }; // eslint-disable-line no-param-reassign
      } else {
        const { _id: connect } = fromGlobalId(data[key].connect);

        prev[key] = { connect }; // eslint-disable-line no-param-reassign
      }
    } else if (data[key]?.create) {
      prev[key] = { create: transformData(data[key].create) }; // eslint-disable-line no-param-reassign, no-use-before-define
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

function transformData(data: Object): Object {
  if (Array.isArray(data)) {
    return data.map(processData);
  }

  return processData(data);
}

export default transformData;
