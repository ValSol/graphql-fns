import type {EntityConfig} from '../../../tsTypes';

import createPushIntoEntityInputType from '../../../types/inputs/createPushIntoEntityInputType';
import getInputFieldNames from '../../../utils/getInputFieldNames';

const extract = (data: {
  [key: string]: any
}, filterObj: any, pushFields: Array<string>, result: Record<any, any>) => {
  Object.keys(filterObj).forEach((key) => {
    const [key2] = key.split('_');
    if (key === 'AND' || key === 'OR' || key === 'NOR') {
      filterObj[key].forEach((filterObj2) => extract(data, filterObj2, pushFields, result));
    } else if (data[key2] === undefined || pushFields.includes(key2)) {
      result[key2] = 1; // eslint-disable-line no-param-reassign
    }
  });
};

type Result = {
  [missingFieldName: string]: 1
};

const extractMissingAndPushDataFields = (
  data: {
    [key: string]: any
  },
  filter: Array<any>,
  entityConfig: EntityConfig,
): Result => {
  const pushFields = getInputFieldNames(entityConfig, createPushIntoEntityInputType);

  const result: Record<string, any> = {};

  filter.forEach((filterObj) => {
    extract(data, filterObj, pushFields, result);
  });

  return Object.keys(result).length ? { ...result, _id: 1 } : {};
};

export default extractMissingAndPushDataFields;
