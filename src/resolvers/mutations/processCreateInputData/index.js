// @flow
import deepEqual from 'fast-deep-equal';

import { Types } from 'mongoose';

import type { ThingConfig } from '../../../flowTypes';
import type { PreparedData } from '../../flowTypes';

import pointFromGqlToMongo from './pointFromGqlToMongo';
import polygonFromGqlToMongo from './polygonFromGqlToMongo';
import processForPushEach from './processForPushEach';
import renumeratePositions from './renumeratePositions';

const getUpdateMany = (rest, arr) => {
  const filteredArr = arr.filter(({ updateMany }) => updateMany);

  if (!filteredArr.length) return null;

  const [obj] = filteredArr.slice(-1);
  if (!obj) return null;
  const {
    updateMany: {
      filter,
      update: { $set },
    },
  } = obj;

  return deepEqual(rest, $set) ? filter : null;
};

const processCreateInputData = (
  data: Object,
  preparedData: PreparedData,
  thingConfig: ThingConfig,
  processingKind: 'create' | 'update' | 'push' | 'updateMany',
  rootFieldsPositions?: Object = {},
  // use mongoose Types in args to let mocking the ObjectId() in tests
  mongooseTypes?: Object = Types,
): PreparedData => {
  const { mains, core, periphery } = preparedData;
  const { id } = data;
  const prepared = [
    { data: { ...data, _id: id || mongooseTypes.ObjectId() }, config: thingConfig },
  ];

  const transform = (data2: Object, thingConfig2: ThingConfig): Object => {
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
      if (processingKind === 'update' && data2[key] === null) {
        if (!prev.$unset) prev.$unset = {}; // eslint-disable-line no-param-reassign
        prev.$unset[key] = 1; // eslint-disable-line no-param-reassign
      }

      if (relationalFieldsObject[key]) {
        const { array, config } = relationalFieldsObject[key];
        if (!array && data2[key].create && data2[key].connect) {
          throw new TypeError(
            `Simultaneous use "create" and "connect" keys with a relationalField "${key}" that not an array!`,
          );
        }
        if (!array && data2[key].connect === null) {
          if (processingKind === 'update') {
            if (!prev.$unset) prev.$unset = {}; // eslint-disable-line no-param-reassign
            prev.$unset[key] = 1; // eslint-disable-line no-param-reassign
          }

          return prev;
        }
        if (data2[key].connect) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key].connect;
        }
        if (data2[key].create) {
          if (array) {
            const ids = data2[key].connect || [];

            const positions = renumeratePositions(
              data2[key].createPositions,
              data2[key].create.length,
              ids.length,
            );

            data2[key].create.forEach((item, i) => {
              // eslint-disable-next-line no-underscore-dangle
              const _id = item.id || mongooseTypes.ObjectId();
              ids.splice(positions[i], 0, _id);
              prepared.push({
                data: { ...item, _id },
                config,
              });
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = ids;
          } else {
            // eslint-disable-next-line no-underscore-dangle
            const _id = data2[key].create.id || mongooseTypes.ObjectId();

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
        if (!array && data2[key].connect === null) {
          if (processingKind === 'update') {
            if (!prev.$unset) prev.$unset = {}; // eslint-disable-line no-param-reassign
            prev.$unset[key] = 1; // eslint-disable-line no-param-reassign
          }

          return prev;
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

            const positions = renumeratePositions(
              data2[key].createPositions,
              data2[key].create.length,
              ids.length,
            );

            data2[key].create.forEach((item, i) => {
              // eslint-disable-next-line no-underscore-dangle
              const _id = item.id || mongooseTypes.ObjectId();
              ids.splice(positions[i], 0, _id);
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
            const _id = data2[key].create.id || mongooseTypes.ObjectId();

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

  let first = true;
  while (prepared.length) {
    const { data: data3, config } = prepared.shift();

    const document = transform(data3, config);

    let item = null;
    if (first) {
      mains.push(document);
      first = false;
      if (processingKind === 'update') {
        // $FlowFixMe
        const { _id, $unset, ...$set } = document;
        const update = {};
        if ($set) update.$set = $set;
        if ($unset) update.$unset = $unset;
        item = [
          {
            updateOne: {
              filter: { _id },
              update,
            },
          },
        ];
      } else if (processingKind === 'push') {
        // $FlowFixMe
        const { _id, ...rest } = document;

        item = processForPushEach(rest, rootFieldsPositions).map((update) => ({
          updateOne: {
            filter: { _id },
            update,
          },
        }));
      } else if (processingKind === 'updateMany') {
        // $FlowFixMe
        const { _id, ...$set } = document;
        const arr = core.get(config);
        const filter = arr && getUpdateMany($set, arr);
        if (filter) {
          filter._id.$in.push(_id); // eslint-disable-line no-underscore-dangle
          continue; // eslint-disable-line no-continue
        } else {
          item = [
            {
              updateMany: {
                filter: { _id: { $in: [_id] } },
                update: { $set },
              },
            },
          ];
        }
      }
    }
    item = item || [{ insertOne: { document } }];

    const coreItem = core.get(config);
    if (coreItem) {
      if (item.length) {
        coreItem.push(...item);
      }
    } else {
      core.set(config, [...item]);
    }
  }

  return { core, periphery, mains };
};

export default processCreateInputData;
