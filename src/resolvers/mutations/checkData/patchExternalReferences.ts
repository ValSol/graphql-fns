import type { DuplexField, EntityConfig, EntityConfigObject, RelationalField } from '@/tsTypes';
import composeFieldsObject from '@/utils/composeFieldsObject';

const patch = (
  externalReferences: Array<string | null>,
  data: {
    [key: string]: any;
  },
  filterObj: any,
  fieldsObj: EntityConfigObject,
) => {
  const updatedFilterObj: Record<string, any> = {};

  // --- this piece of code must to run along with the piece of code in extractExternalReferences

  Object.keys(filterObj).forEach((key) => {
    if (key.endsWith('_')) {
      const key2 = key.slice(0, -1);
      const attributes = fieldsObj[key2];

      if (!(attributes as RelationalField | DuplexField).config) {
        throw new TypeError(`Field "${key2}" does not have "config" attribute!`);
      }
      const { array } = attributes;

      const {
        [key2]: { connect },
      } = data;

      if (connect === undefined) {
        throw new TypeError(`Field "${key2}" does not have "connect" attribute!`);
      }

      if (array) {
        const ids = connect.map(() => externalReferences.shift()).filter(Boolean);
        updatedFilterObj[`${key2}_in`] = ids;
      } else {
        const id = externalReferences.shift();
        if (id) {
          updatedFilterObj[key2] = id;
        } else {
          // construct condition that is guaranteed NOT to be met
          updatedFilterObj[`${key2}_ne`] = connect;
        }
      }
    } else if (key === 'AND' || key === 'OR' || key === 'NOR') {
      const tmpArr = [];
      filterObj[key].forEach((filterObj2) => {
        const updatedFilterObjItem = patch(externalReferences, data, filterObj2, fieldsObj);
        if (Object.keys(updatedFilterObjItem).length > 0) {
          tmpArr.push(updatedFilterObjItem);
        }
      });
      if (tmpArr.length > 0) {
        updatedFilterObj[key] = tmpArr;
      }
    } else {
      updatedFilterObj[key] = filterObj[key];
    }
  });

  return updatedFilterObj;
};

const processData = (
  data: {
    [key: string]: any;
  },
  fieldsObj: EntityConfigObject,
) => {
  const result: Record<string, any> = {};

  Object.keys(data).forEach((key) => {
    const attributes = fieldsObj[key];

    // *** quick patch, may corrupt "dataCheck" (may be not)
    if (!attributes) {
      return;
    }
    // ***

    const { array, type: fieldType } = attributes;

    if (fieldType === 'relationalFields' || fieldType === 'duplexFields') {
      const { connect, create } = data[key];
      const { array } = attributes;
      if (connect) {
        if (array) {
          result[key] =
            connect !== null && connect !== undefined ? connect.map((item) => item.toString()) : [];
        } else {
          result[key] = connect !== null && connect !== undefined ? connect.toString() : connect;
        }
      } else if (create) {
        // use fake 'newId' value as dummy value for 'create'
        result[key] = array ? ['newId'] : 'newId';
      }
    } else {
      result[key] = data[key];
    }
  });

  return result;
};

const patchExternalReferences = (
  externalReferences: Array<string | null>,
  prevData: {
    [key: string]: any;
  },
  prevFilter: Array<any>,
  entityConfig: EntityConfig,
): {
  data: {
    [key: string]: any;
  };
  filter: Array<any>;
} => {
  const { fieldsObject: fieldsObj } = composeFieldsObject(entityConfig);

  const filter = prevFilter.map((filterObj) =>
    patch(externalReferences, prevData, filterObj, fieldsObj),
  );

  const data = processData(prevData, fieldsObj);

  return { data, filter };
};

export default patchExternalReferences;
