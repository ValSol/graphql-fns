import deepEqual from 'fast-deep-equal';

import type {
  EmbeddedField,
  EntityConfig,
  GeospatialField,
  FileField,
  RelationalField,
  DuplexField,
} from '../tsTypes';

import composeFieldsObject from './composeFieldsObject';

const isNotDate = (date: any) =>
  new Date(date).toString() === 'Invalid Date' || Number.isNaN(new Date(date));

const coerceDataToGqlBasic = (
  ObjectId: any,
  data: any,
  prevData: null | any,
  entityConfig: EntityConfig,
  allFields?: boolean,
  // use when import data from sourse with extra fields
  skipUnusedFields?: boolean,
  // when create data to prevent creation text fields with "" value
  setNullForEmptyText?: boolean,
): any => {
  const fieldsObject = composeFieldsObject(entityConfig);

  const { id, createdAt, updatedAt, ...rest } = data;

  const result = Object.keys(rest).reduce<Record<string, any>>((prev, key) => {
    if (!skipUnusedFields && !fieldsObject[key]) {
      throw new TypeError(`Found undeclared in entity "${entityConfig.name}" field "${key}"!`);
    }
    if (skipUnusedFields && !fieldsObject[key]) return prev;

    const { array, type: fieldType } = fieldsObject[key];

    if (prevData && deepEqual(data[key], prevData[key])) {
      return prev;
    }

    if (fieldsObject[key].type === 'embeddedFields' || fieldsObject[key].type === 'fileFields') {
      const { config } = fieldsObject[key] as EmbeddedField | FileField;
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key].map((item) =>
          coerceDataToGqlBasic(
            ObjectId,
            item,
            null,
            config,
            allFields,
            skipUnusedFields,
            setNullForEmptyText,
          ),
        );
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data[key]
          ? coerceDataToGqlBasic(
              ObjectId,
              data[key],
              null,
              config,
              allFields,
              skipUnusedFields,
              setNullForEmptyText,
            )
          : null;
      }
    } else if (fieldType === 'relationalFields' || fieldType === 'duplexFields') {
      const { config } = fieldsObject[key] as RelationalField | DuplexField;
      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[key] =
          !data[key] || !data[key].length
            ? { connect: [] }
            : data[key].reduce((prev2, preItem) => {
                const item = ObjectId && preItem instanceof ObjectId ? preItem.toString() : preItem;

                if (typeof item === 'string') {
                  if (prev2.connect) {
                    prev2.connect.push(item);
                  } else {
                    prev2.connect = [item]; // eslint-disable-line no-param-reassign
                  }
                } else if (prev2.create) {
                  prev2.create.push(
                    coerceDataToGqlBasic(
                      ObjectId,
                      item,
                      null,
                      config,
                      allFields,
                      skipUnusedFields,
                      setNullForEmptyText,
                    ),
                  );
                } else {
                  // eslint-disable-next-line no-param-reassign
                  prev2.create = [
                    coerceDataToGqlBasic(
                      ObjectId,
                      item,
                      null,
                      config,
                      allFields,
                      skipUnusedFields,
                      setNullForEmptyText,
                    ),
                  ];
                }
                return prev2;
              }, {});
      } else if (!data[key]) {
        prev[key] = { connect: null }; // eslint-disable-line no-param-reassign
      } else {
        const keyData =
          ObjectId && data[key] instanceof ObjectId ? data[key].toString() : data[key];

        if (typeof keyData === 'string') {
          prev[key] = { connect: keyData }; // eslint-disable-line no-param-reassign
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[key] = {
            create: coerceDataToGqlBasic(
              ObjectId,
              data[key],
              null,
              config,
              allFields,
              skipUnusedFields,
              setNullForEmptyText,
            ),
          };
        }
      }
    } else if (fieldType === 'enumFields') {
      if (array) {
        prev[key] = data[key]; // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] || null; // eslint-disable-line no-param-reassign
      }
    } else if (fieldType === 'textFields' && setNullForEmptyText) {
      if (array) {
        prev[key] = data[key].filter((item) => item); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] || null; // eslint-disable-line no-param-reassign
      }
    } else if (fieldType === 'intFields' || fieldType === 'floatFields') {
      if (array) {
        prev[key] = data[key].filter((item) => item !== ''); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] === '' ? null : data[key]; // eslint-disable-line no-param-reassign
      }
    } else if (fieldType === 'dateTimeFields') {
      if (array) {
        prev[key] = data[key].map((item) => (isNotDate(item) ? null : item)).filter(Boolean); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = isNotDate(data[key]) ? null : data[key]; // eslint-disable-line no-param-reassign
      }
    } else if (fieldType === 'booleanFields') {
      if (array) {
        prev[key] = data[key].map((item) => !!item); // eslint-disable-line no-param-reassign
      } else {
        prev[key] = data[key] === null ? null : !!data[key]; // eslint-disable-line no-param-reassign
      }
    } else if (fieldsObject[key].type === 'geospatialFields') {
      const { geospatialType } = fieldsObject[key] as GeospatialField;
      if (geospatialType === 'Point') {
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key]
            .map((item) => {
              const { lng, lat } = item;
              const item2 = skipUnusedFields ? { lng, lat } : item;
              return lng === '' || lat === '' ? null : item2; // eslint-disable-line no-param-reassign
            })
            .filter(Boolean);
        } else {
          const { lng, lat } = data[key];
          const item = skipUnusedFields ? { lng, lat } : data[key];
          prev[key] = lng === '' || lat === '' ? null : item; // eslint-disable-line no-param-reassign
        }
      } else if (geospatialType === 'Polygon') {
        // TODO expand test for skipUnusedFields situations
        // TODO expand test for all empty situations
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data[key]
            .map((item) => {
              const {
                externalRing: { ring: externalRing },
              } = item;
              return externalRing.length < 4 ? null : item; // eslint-disable-line no-param-reassign
            })
            .filter(Boolean);
        } else {
          const {
            externalRing: { ring: externalRing },
          } = data[key];
          prev[key] = externalRing.length < 4 ? null : data[key]; // eslint-disable-line no-param-reassign
        }
      } else {
        throw new TypeError(`Invalid geospatialType: "${geospatialType}" of field "${key}"!`);
      }
    } else {
      prev[key] = data[key]; // eslint-disable-line no-param-reassign
    }
    return prev;
  }, {});

  if (allFields) {
    if (id) result.id = id;
    if (createdAt) result.createdAt = createdAt;
    if (updatedAt) result.updatedAt = updatedAt;
  }

  return result;
};

export default coerceDataToGqlBasic;
