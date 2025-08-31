import type { DuplexField, EntityConfig, EntityConfigObject, RelationalField } from '@/tsTypes';
import composeFieldsObject from '@/utils/composeFieldsObject';

const extract = (
  data: {
    [key: string]: any;
  },
  filterObj: any,
  fieldsObj: EntityConfigObject,
  result: Array<[string, string, [any]]>,
) => {
  // --- this piece of code must to run along with the piece of code in patchExternalReferences

  Object.keys(filterObj).forEach((key) => {
    if (key.endsWith('_')) {
      const key2 = key.slice(0, -1);

      const attributes = fieldsObj[key2] as RelationalField | DuplexField;

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
  data: {
    [key: string]: any;
  },
  filter: Array<any>,
  entityConfig: EntityConfig,
): Array<[string, string, [any]]> => {
  const { fieldsObject: fieldsObj } = composeFieldsObject(entityConfig);

  const result: Array<[string, string, [any]]> = [];

  filter.forEach((filterObj) => {
    extract(data, filterObj, fieldsObj, result);
  });

  return result;
};

export default extractExternalReferences;
