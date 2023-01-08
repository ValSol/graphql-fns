// @flow
import type { EntityConfig } from '../../../flowTypes';
import composeFieldsObject from '../../../utils/composeFieldsObject';

const extract = (data, filterObj, fieldsObj, result) => {
  // --- this piece of code must to run along with the piece of code in patchExternalReferences

  Object.keys(filterObj).forEach((key) => {
    if (key.endsWith('_')) {
      const key2 = key.slice(0, -1);
      const { attributes } = fieldsObj[key2];

      if (!attributes.config) {
        throw new TypeError(`Field "${key2}" does not have "config" attribute!`);
      }
      const {
        array,
        config: { name },
      } = attributes;

      const {
        [key2]: { connect },
      } = data;

      if (connect === undefined) {
        throw new TypeError(`Field "${key2}" does not have "connect" attribute!`);
      }

      if (array) {
        connect.forEach((item) => {
          result.push([name, item, [filterObj[key]]]);
        });
      } else {
        result.push([name, connect, [filterObj[key]]]);
      }
    } else if (key === 'AND' || key === 'OR' || key === 'NOR') {
      filterObj[key].forEach((filterObj2) => extract(data, filterObj2, fieldsObj, result));
    }
  });
};

const extractExternalReferences = (
  data: { [key: string]: any },
  filter: Array<Object>,
  entityConfig: EntityConfig,
): Array<[string, string, [Object]]> => {
  const fieldsObj = composeFieldsObject(entityConfig);

  const result = [];

  filter.forEach((filterObj) => {
    extract(data, filterObj, fieldsObj, result);
  });

  return result;
};

export default extractExternalReferences;
