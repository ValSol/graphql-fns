// @flow
import type { ThingConfig } from '../../flowTypes';

import pointFromGqlToMongo from './pointFromGqlToMongo';
import polygonFromGqlToMongo from './polygonFromGqlToMongo';

const processUpdateInputData = (data: Object, thingConfig: ThingConfig): Object => {
  const { geospatialFields } = thingConfig;

  const geospatialFieldsObject = {};
  if (geospatialFields) {
    geospatialFields.reduce((prev, { name, array, geospatialType }) => {
      // eslint-disable-next-line
      prev[name] = { array, geospatialType };
      return prev;
    }, geospatialFieldsObject);
  }

  return Object.keys(data).reduce((prev, key) => {
    if (geospatialFieldsObject[key]) {
      const { array, geospatialType } = geospatialFieldsObject[key];
      if (array) {
        if (geospatialType === 'Point') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map((value) => pointFromGqlToMongo(value));
        }
        if (geospatialType === 'Polygon') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key].map((value) => polygonFromGqlToMongo(value));
        }
      } else {
        if (geospatialType === 'Point') {
          // eslint-disable-next-line no-param-reassign
          prev[key] = pointFromGqlToMongo(data[key]);
        }
        if (geospatialType === 'Polygon') {
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

export default processUpdateInputData;
