// @flow
import type { ThingConfig } from '../../../flowTypes';
import composeFieldsObject from '../../../utils/composeFieldsObject';

const patch = (externalReferences, data, toCreate, filterObj, fieldsObj) => {
  const updatedFilterObj = {};

  // --- this piece of code must to run along with the piece of code in extractExternalReferences

  Object.keys(filterObj).forEach((key) => {
    const [baseKey] = key.split('_');
    if (key.endsWith('_')) {
      const key2 = key.slice(0, -1);
      const { attributes } = fieldsObj[key2];

      if (!attributes.config) {
        throw new TypeError(`Field "${key2}" does not have "config" attribute!`);
      }
      const { array } = attributes;

      if (!data[key2] && !toCreate) {
        return;
      }

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
    } else if (key === 'AND' || key === 'OR') {
      updatedFilterObj[key] = [];
      filterObj[key].forEach((filterObj2) =>
        updatedFilterObj[key].push(
          patch(externalReferences, data, toCreate, filterObj2, fieldsObj),
        ),
      );
    } else if (data[baseKey] !== undefined) {
      updatedFilterObj[key] = filterObj[key];
    }
  });

  // ---

  return updatedFilterObj;
};

const processData = (data, fieldsObj) => {
  const result = {};

  Object.keys(data).forEach((key) => {
    const { attributes, kind } = fieldsObj[key];

    if (kind === 'relationalFields' || kind === 'duplexFields') {
      const { connect, create } = data[key];
      const { array } = attributes;
      if (connect) {
        result[key] = connect; // eslint-disable-line no-param-reassign
      } else if (create) {
        // use fake 'newId' value as dummy value for 'create'
        result[key] = array ? ['newId'] : 'newId'; // eslint-disable-line no-param-reassign
      }
    } else {
      result[key] = data[key]; // eslint-disable-line no-param-reassign
    }
  });

  return result;
};

const patchExternalReferences = (
  externalReferences: Array<string | null>,
  prevData: { [key: string]: any },
  prevFilter: Array<Object>,
  thingConfig: ThingConfig,
  toCreate: boolean,
): { data: { [key: string]: any }, filter: Array<Object> } => {
  const fieldsObj = composeFieldsObject(thingConfig);

  const filter = prevFilter.map((filterObj) =>
    patch(externalReferences, prevData, toCreate, filterObj, fieldsObj),
  );

  const data = processData(prevData, fieldsObj);

  return { data, filter };
};

export default patchExternalReferences;
