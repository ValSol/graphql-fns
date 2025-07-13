import fromGlobalId from '../../fromGlobalId';

const processData = (data: any) =>
  Object.keys(data).reduce<Record<string, any>>((prev, key) => {
    if (key === 'id') {
      const { _id: id } = fromGlobalId(data.id);

      prev.id = id;
    } else if (data[key]?.connect) {
      if (Array.isArray(data[key].connect)) {
        const connect = data[key].connect.map((globalId) => fromGlobalId(globalId)._id);

        prev[key] = { connect };
      } else {
        const { _id: connect } = fromGlobalId(data[key].connect);

        prev[key] = { connect };
      }
    } else if (data[key]?.create) {
      prev[key] = { create: transformData(data[key].create) };
    } else {
      prev[key] = data[key];
    }

    return prev;
  }, {});

function transformData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(processData);
  }

  return processData(data);
}

export default transformData;
