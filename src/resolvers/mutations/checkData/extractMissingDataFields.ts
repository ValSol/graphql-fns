const extract = (data: {
  [key: string]: any
}, filterObj: any, result: Record<any, any>) => {
  Object.keys(filterObj).forEach((key) => {
    const [key2] = key.split('_');
    if (key === 'AND' || key === 'OR' || key === 'NOR') {
      filterObj[key].forEach((filterObj2) => extract(data, filterObj2, result));
    } else if (data[key2] === undefined) {
      result[key2] = 1; // eslint-disable-line no-param-reassign
    }
  });
};

type Result = {
  [missingFieldName: string]: 1
};

const extractMissingDataFields = (
  data: {
    [key: string]: any
  },
  filter: Array<any>,
): Result => {
  const result: Record<string, any> = {};

  filter.forEach((filterObj) => {
    extract(data, filterObj, result);
  });

  return Object.keys(result).length ? { ...result, _id: 1 } : {};
};

export default extractMissingDataFields;
