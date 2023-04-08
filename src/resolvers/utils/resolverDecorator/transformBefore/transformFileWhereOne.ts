import fromGlobalId from '../../fromGlobalId';

const processWhereOne = (whereOne: any) =>
  Object.keys(whereOne).reduce<Record<string, any>>((prev, key) => {
    if (key === 'id') {
      const { _id: id } = fromGlobalId(whereOne[key]);

      prev[key] = id; // eslint-disable-line no-param-reassign
    } else {
      prev[key] = whereOne[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

const transformFileWhereOne = (whereOne: any): any => {
  if (Array.isArray(whereOne)) {
    return whereOne.map((whereOne2) => processWhereOne(whereOne2));
  }

  return processWhereOne(whereOne);
};

export default transformFileWhereOne;
