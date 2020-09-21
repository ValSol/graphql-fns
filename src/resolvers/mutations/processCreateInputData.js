// @flow

import { Types } from 'mongoose';

import type { Periphery, ThingConfig } from '../../flowTypes';

import pointFromGqlToMongo from './pointFromGqlToMongo';
import polygonFromGqlToMongo from './polygonFromGqlToMongo';

type ProcessCreateInputDataResult = {
  core: { [ThingConfig]: Array<Object> },
  periphery: Periphery,
  single: Boolean,
  first: Object,
};

const processCreateInputData = (
  data: Object,
  initialCore: null | Map<ThingConfig, Array<Object>>,
  initialPeriphery: null | Periphery,
  thingConfig: ThingConfig,
  forUpdate?: boolean,
  // use mongoose Types in args to let mocking the ObjectId() in tests
  mongooseTypes?: Object = Types,
): Object => {
  const core = initialCore || new Map();
  const periphery = initialPeriphery || new Map();
  const { id } = data;
  const prepared = [
    { data: { ...data, _id: id || mongooseTypes.ObjectId() }, config: thingConfig },
  ];

  const transform = (data2: Object, thingConfig2: ThingConfig): ProcessCreateInputDataResult => {
    const {
      booleanFields,
      dateTimeFields,
      duplexFields,
      fileFields,
      floatFields,
      intFields,
      embeddedFields,
      enumFields,
      geospatialFields,
      relationalFields,
      textFields,
    } = thingConfig2;

    const relationalFieldsObject = {};
    if (relationalFields) {
      relationalFields.reduce((prev, { name, array, config }) => {
        // eslint-disable-next-line
        prev[name] = { array, config };
        return prev;
      }, relationalFieldsObject);
    }

    const duplexFieldsObject = {};
    if (duplexFields) {
      duplexFields.reduce((prev, { name, oppositeName, array, config }) => {
        if (!config.duplexFields) {
          throw new TypeError('Expected a duplexFields in config!');
        }
        const duplexField = config.duplexFields.find(({ name: name2 }) => name2 === oppositeName);
        if (!duplexField) {
          throw new TypeError(`Expected a duplexField with name "${oppositeName}"!`);
        }
        const { array: oppositeArray, config: oppositeConfig } = duplexField;
        // eslint-disable-next-line
        prev[name] = { array, config, oppositeArray, oppositeConfig, oppositeName };
        return prev;
      }, duplexFieldsObject);
    }

    const embeddedFieldsObject = {};
    if (embeddedFields) {
      embeddedFields.reduce((prev, { array, config, name }) => {
        // eslint-disable-next-line
        prev[name] = { array, config };
        return prev;
      }, embeddedFieldsObject);
    }

    const fileFieldsObject = {};
    if (fileFields) {
      fileFields.reduce((prev, { array, config, name }) => {
        // eslint-disable-next-line
        prev[name] = { array, config };
        return prev;
      }, fileFieldsObject);
    }

    // the same code as for embeddedFields
    const geospatialFieldsObject = {};
    if (geospatialFields) {
      geospatialFields.reduce((prev, { name, array, geospatialType }) => {
        // eslint-disable-next-line
        prev[name] = { array, geospatialType };
        return prev;
      }, geospatialFieldsObject);
    }

    const scalarFieldsArray = ['_id', 'createdAt', 'updatedAt'];

    if (textFields) {
      textFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    if (intFields) {
      intFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    if (floatFields) {
      floatFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    if (booleanFields) {
      booleanFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    if (dateTimeFields) {
      dateTimeFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    if (enumFields) {
      enumFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    return Object.keys(data2).reduce((prev, key) => {
      if (data2[key] === undefined) return prev;
      if (forUpdate && data2[key] === null) {
        prev[key] = null; // eslint-disable-line no-param-reassign
        return prev;
      }

      if (relationalFieldsObject[key]) {
        const { array, config } = relationalFieldsObject[key];
        if (!array && data2[key].create && data2[key].connect) {
          throw new TypeError(
            `Simultaneous use "create" and "connect" keys with a relationalField "${key}" that not an array!`,
          );
        }
        if (data2[key].connect) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key].connect;
        }
        if (data2[key].create) {
          if (array) {
            const ids = data2[key].connect || [];
            data2[key].create.forEach((item) => {
              // eslint-disable-next-line no-underscore-dangle
              const _id = mongooseTypes.ObjectId();
              ids.push(_id);
              prepared.push({
                data: { ...item, _id },
                config,
              });
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = ids;
          } else {
            // eslint-disable-next-line no-underscore-dangle
            const _id = mongooseTypes.ObjectId();

            prepared.push({
              data: { ...data2[key].create, _id },
              config,
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = _id;
          }
        }
      } else if (duplexFieldsObject[key]) {
        const { array, config, oppositeArray, oppositeConfig, oppositeName } = duplexFieldsObject[
          key
        ];
        if (!array && data2[key].create && data2[key].connect) {
          throw new TypeError(
            `Simultaneous use "create" and "connect" keys with a duplexField "${key}" that not an array!`,
          );
        }
        if (data2[key].connect) {
          if (array) {
            const { connect: oppositeIds } = data2[key];
            // eslint-disable-next-line no-param-reassign
            prev[key] = oppositeIds;

            oppositeIds.forEach((oppositeId) => {
              const item = {
                updateOne: {
                  filter: { _id: oppositeId },
                  update: oppositeArray
                    ? // eslint-disable-next-line no-underscore-dangle
                      { $push: { [oppositeName]: data2._id } }
                    : // eslint-disable-next-line no-underscore-dangle
                      { [oppositeName]: data2._id },
                },
              };
              const coreItem = core.get(config);
              if (coreItem) {
                coreItem.push(item);
              } else {
                core.set(config, [item]);
              }
              if (!oppositeArray) {
                const peripheryItem = periphery.get(config);
                if (peripheryItem) {
                  if (peripheryItem[oppositeName]) {
                    peripheryItem[oppositeName].oppositeIds.push(oppositeId);
                  } else {
                    peripheryItem[oppositeName] = {
                      array: true,
                      name: key,
                      oppositeConfig,
                      oppositeIds: [oppositeId],
                    };
                  }
                } else {
                  periphery.set(config, {
                    [oppositeName]: {
                      array: true,
                      name: key,
                      oppositeConfig,
                      oppositeIds: [oppositeId],
                    },
                  });
                }
              }
            });
          } else {
            const { connect: oppositeId } = data2[key];
            // eslint-disable-next-line no-param-reassign
            prev[key] = oppositeId;

            const item = {
              updateOne: {
                filter: { _id: oppositeId },
                update: oppositeArray
                  ? // eslint-disable-next-line no-underscore-dangle
                    { $push: { [oppositeName]: data2._id } }
                  : // eslint-disable-next-line no-underscore-dangle
                    { [oppositeName]: data2._id },
              },
            };

            const coreItem = core.get(config);
            if (coreItem) {
              coreItem.push(item);
            } else {
              core.set(config, [item]);
            }

            if (!oppositeArray) {
              const peripheryItem = periphery.get(config);
              if (peripheryItem) {
                if (peripheryItem[oppositeName]) {
                  peripheryItem[oppositeName].oppositeIds.push(oppositeId);
                } else {
                  peripheryItem[oppositeName] = {
                    array: false,
                    name: key,
                    oppositeConfig,
                    oppositeIds: [oppositeId],
                  };
                }
              } else {
                periphery.set(config, {
                  [oppositeName]: {
                    array: false,
                    name: key,
                    oppositeConfig,
                    oppositeIds: [oppositeId],
                  },
                });
              }
            }
          }
        }

        if (data2[key].create) {
          if (array) {
            const ids = data2[key].connect || [];
            data2[key].create.forEach((item) => {
              // eslint-disable-next-line no-underscore-dangle
              const _id = mongooseTypes.ObjectId();
              ids.push(_id);
              prepared.push({
                data: {
                  ...item,
                  _id,
                  // eslint-disable-next-line no-underscore-dangle
                  [oppositeName]: oppositeArray ? [data2._id] : data2._id,
                },
                config,
              });
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = ids;
          } else {
            // eslint-disable-next-line no-underscore-dangle
            const _id = mongooseTypes.ObjectId();

            prepared.push({
              data: {
                ...data2[key].create,
                _id,
                // eslint-disable-next-line no-underscore-dangle
                [oppositeName]: oppositeArray ? [data2._id] : data2._id,
              },
              config: duplexFieldsObject[key].config,
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = _id;
          }
        }
        if (data2[key].connect === undefined && data2[key].create === undefined && data2[key]) {
          // set id of created thing
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key];
        }
      } else if (embeddedFieldsObject[key]) {
        const { array, config } = embeddedFieldsObject[key];
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key].map((value) => transform(value, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key] === null ? null : transform(data2[key], config);
        }
      } else if (fileFieldsObject[key]) {
        const { array, config } = fileFieldsObject[key];
        if (array) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key].map((value) => transform(value, config));
        } else {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key] === null ? null : transform(data2[key], config);
        }
      } else if (geospatialFieldsObject[key]) {
        const { array, geospatialType } = geospatialFieldsObject[key];
        if (array) {
          if (geospatialType === 'Point') {
            // eslint-disable-next-line no-param-reassign
            prev[key] = data2[key].map((value) => pointFromGqlToMongo(value));
          }
          if (geospatialType === 'Polygon') {
            // eslint-disable-next-line no-param-reassign
            prev[key] = data2[key].map((value) => polygonFromGqlToMongo(value));
          }
        } else {
          if (geospatialType === 'Point') {
            // eslint-disable-next-line no-param-reassign
            prev[key] = pointFromGqlToMongo(data2[key]);
          }
          if (geospatialType === 'Polygon') {
            // eslint-disable-next-line no-param-reassign
            prev[key] = polygonFromGqlToMongo(data2[key]);
          }
        }
      } else if (scalarFieldsArray.includes(key)) {
        if (data2[key] !== null) {
          prev[key] = data2[key]; // eslint-disable-line no-param-reassign
        }
      }
      return prev;
    }, {});
  };

  let first = null;
  while (prepared.length) {
    const { data: data3, config } = prepared.shift();

    const document = transform(data3, config);
    if (!first) {
      first = document;
      if (forUpdate) continue; // eslint-disable-line no-continue
    }
    const item = { insertOne: { document } };

    const coreItem = core.get(config);
    if (coreItem) {
      coreItem.push(item);
    } else {
      core.set(config, [item]);
    }
  }

  let single = false;
  if (core.size === 1) {
    const key = core.keys().next().value;

    if (!key) {
      throw new TypeError('Expected an config object as key of "core" Map');
    }
    const array = core.get(key);

    if (!array) {
      throw new TypeError('Expected an array as value of "core" Map');
    }

    if (array.length === 1) {
      single = true;
    }
  }

  return { core, periphery, single, first };
};

export default processCreateInputData;
