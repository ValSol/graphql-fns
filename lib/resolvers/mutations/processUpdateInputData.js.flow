// @flow
import type { ThingConfig } from '../../flowTypes';

const pointFromGqlToMongo = require('./pointFromGqlToMongo');
const polygonFromGqlToMongo = require('./polygonFromGqlToMongo');

const processCreateInputData = (data: Object, thingConfig: ThingConfig): Object => {
  const { geospatialFields } = thingConfig;

  const geospatialFieldsObject = {};
  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, array, type }) => {
      // eslint-disable-next-line
      prev[name] = { array, type };
      return prev;
    }, geospatialFieldsObject);
  }

  return Object.keys(data).reduce((prev, key) => {
    if (geospatialFieldsObject[key]) {
      const { array, type } = geospatialFieldsObject[key];
      if (array) {
        if (type === 'Point') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map(value => pointFromGqlToMongo(value));
        }
        if (type === 'Polygon') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map(value => polygonFromGqlToMongo(value));
        }
      } else {
        if (type === 'Point') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = pointFromGqlToMongo(data[key]);
        }
        if (type === 'Polygon') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = polygonFromGqlToMongo(data[key]);
        }
      }
    } else {
      // eslint-disable-next-line no-param-reassign
      prev[key] = data[key];
    }
    return prev;
  }, {});
};

module.exports = processCreateInputData;
