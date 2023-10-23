import fromGlobalId from '../../fromGlobalId';

const processField = (globalId: any) => {
  if (!globalId) return globalId;

  const { _id: id } = fromGlobalId(globalId);

  return id;
};

const transformFileWhere = (where: any): any =>
  Object.keys(where).reduce<Record<string, any>>((prev, key) => {
    if (key === 'id_in') {
      prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
    } else if (key === 'id_nin') {
      prev[key] = where[key].map(processField); // eslint-disable-line no-param-reassign
    } else if (key === 'AND' || key === 'NOR' || key === 'OR') {
      prev[key] = where[key].map((item) => transformFileWhere(item)); // eslint-disable-line no-param-reassign
    } else {
      prev[key] = where[key]; // eslint-disable-line no-param-reassign
    }

    return prev;
  }, {});

export default transformFileWhere;
