// @flow

const clearData = (data: Object): Object => {
  if (Array.isArray(data)) {
    return data.map(item => clearData(item));
  }
  if (data === Object(data)) {
    return Object.keys(data)
      .filter(key => key !== '__typename')
      .reduce((prev, key) => {
        if (data[key]) prev[key] = clearData(data[key]); // eslint-disable-line no-param-reassign
        return prev;
      }, {});
  }
  return data;
};

export default clearData;
