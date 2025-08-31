import deepEqual from 'fast-deep-equal';
import { Types } from 'mongoose';

import type { TangibleEntityConfig } from '@/tsTypes';
import type { Core, PreparedData } from '@/resolvers/tsTypes';

import composeFieldsObject from '@/utils/composeFieldsObject';
import whereFromGlobalIds from '@/resolvers/utils/whereFromGlobalIds';
import multiPolygonFromGqlToMongo from './multiPolygonFromGqlToMongo';
import pointFromGqlToMongo from './pointFromGqlToMongo';
import polygonFromGqlToMongo from './polygonFromGqlToMongo';
import processForPushEach from './processForPushEach';
import renumeratePositions from './renumeratePositions';

const getUpdateMany = (rest: any, arr: Array<any>) => {
  const filteredArr = arr.filter(({ updateMany }) => updateMany);

  if (filteredArr.length === 0) return null;

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
  data: any,
  preparedData: PreparedData,
  entityConfig: TangibleEntityConfig,
  processingKind: 'create' | 'update' | 'push' | 'updateMany',
  rootFieldsPositions: any = {},
  // use mongoose Types in args to let mocking the ObjectId() in tests
  mongooseTypes: any = Types,
): PreparedData => {
  const { mains, core, periphery } = preparedData;
  const { id } = data;
  const prepared = [
    { data: { ...data, _id: id || new mongooseTypes.ObjectId() }, config: entityConfig },
  ];

  const transform = (data2: any, entityConfig2: TangibleEntityConfig): any => {
    const {
      booleanFields = [],
      dateTimeFields = [],
      floatFields = [],
      intFields = [],
      embeddedFields = [],
      enumFields = [],
      geospatialFields = [],
      textFields = [],
      type: entityType,
    } = entityConfig2;

    const { fieldsObject } = composeFieldsObject(entityConfig2);

    const relationalFieldsObject: {
      [fieldName: string]: { array?: boolean; config: TangibleEntityConfig };
    } = {};

    const filterFieldsObject: {
      [fieldName: string]: { array?: boolean; config: TangibleEntityConfig };
    } = {};

    const duplexFieldsObject: {
      [fieldName: string]: {
        array?: boolean;
        config: TangibleEntityConfig;
        oppositeArray?: boolean;
        oppositeConfig: TangibleEntityConfig;
        oppositeName: string;
      };
    } = {};

    // use "|| true" & "entityConfig2 as any" to let duplexFields & relationalFields inside embedded fields
    // so if schema will allow this processCreateInputData will correctly process data
    if (entityType === 'tangible' || true) {
      const { duplexFields = [], relationalFields = [], filterFields = [] } = entityConfig2 as any;

      relationalFields.reduce((prev, { name, array, config }) => {
        prev[name] = { array, config };
        return prev;
      }, relationalFieldsObject);

      filterFields.reduce((prev, { name, array, config }) => {
        prev[name] = { array, config };
        return prev;
      }, filterFieldsObject);

      duplexFields.reduce((prev, { name, oppositeName, parent, array, config }) => {
        if (!config.duplexFields) {
          throw new TypeError('Expected a duplexFields in config!');
        }
        const duplexField = config.duplexFields.find(({ name: name2 }) => name2 === oppositeName);
        if (!duplexField) {
          throw new TypeError(`Expected the duplexField with name "${oppositeName}"!`);
        }
        if (parent && duplexField.parent) {
          throw new TypeError(
            `Got the both opposite duplexFields "${name}" && "${oppositeName}" are parent!`,
          );
        }
        const { array: oppositeArray, config: oppositeConfig } = duplexField;

        prev[name] = { array, config, oppositeArray, oppositeConfig, oppositeName };
        return prev;
      }, duplexFieldsObject);
    }

    const embeddedFieldsObject: Record<string, any> = {};
    embeddedFields.reduce((prev, { array, config, name }) => {
      prev[name] = { array, config };
      return prev;
    }, embeddedFieldsObject);

    // the same code as for embeddedFields
    const geospatialFieldsObject: Record<string, any> = {};
    geospatialFields.reduce((prev, { name, array, geospatialType }) => {
      prev[name] = { array, geospatialType };
      return prev;
    }, geospatialFieldsObject);

    const scalarFieldsArray = ['_id', 'createdAt', 'updatedAt'];

    textFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, scalarFieldsArray);

    intFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, scalarFieldsArray);

    floatFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, scalarFieldsArray);

    booleanFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, scalarFieldsArray);

    dateTimeFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, scalarFieldsArray);

    enumFields.reduce((prev, { name }) => {
      prev.push(name);
      return prev;
    }, scalarFieldsArray);

    return Object.keys(data2).reduce<Record<string, any>>((prev, key) => {
      if (data2[key] === undefined) return prev;

      if (fieldsObject[key]?.type === 'calculatedFields') return prev;

      if (processingKind === 'update' && data2[key] === null) {
        if (!fieldsObject[key]) {
          throw new TypeError(`Got incorrect field name: "${key}" from "data" input!`);
        }

        if (fieldsObject[key].array && fieldsObject[key].type !== 'filterFields') {
          throw new TypeError(
            `Try unset array field: "${key}" of entity: "${entityConfig2.name}"!`,
          );
        }

        if (!prev.$unset) prev.$unset = {};

        prev.$unset[key] = 1;

        return prev;
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
            if (!prev.$unset) prev.$unset = {};
            prev.$unset[key] = 1;
          }

          return prev;
        }
        if (data2[key].connect) {
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
              const _id = item.id || new mongooseTypes.ObjectId();
              ids.splice(positions[i], 0, _id);
              prepared.push({
                data: { ...item, _id },
                config,
              });
            });

            prev[key] = ids;
          } else {
            const _id = data2[key].create.id || new mongooseTypes.ObjectId();

            prepared.push({
              data: { ...data2[key].create, _id },
              config,
            });

            prev[key] = _id;
          }
        }
      } else if (duplexFieldsObject[key]) {
        const { array, config, oppositeArray, oppositeConfig, oppositeName } =
          duplexFieldsObject[key];
        if (!array && data2[key].create && data2[key].connect) {
          throw new TypeError(
            `Simultaneous use "create" and "connect" keys with a duplexField "${key}" that not an array!`,
          );
        }
        if (!array && data2[key].connect === null) {
          if (processingKind === 'update') {
            if (!prev.$unset) prev.$unset = {};
            prev.$unset[key] = 1;
          }

          return prev;
        }
        if (data2[key].connect) {
          if (array) {
            const { connect: oppositeIds } = data2[key];

            prev[key] = oppositeIds;

            oppositeIds.forEach((oppositeId) => {
              const item = {
                updateOne: {
                  filter: { _id: oppositeId },
                  update: oppositeArray
                    ? { $push: { [oppositeName]: data2._id } }
                    : { [oppositeName]: data2._id },
                },
              } as const;
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

            prev[key] = oppositeId;

            const item = {
              updateOne: {
                filter: { _id: oppositeId },
                update: oppositeArray
                  ? { $push: { [oppositeName]: data2._id } }
                  : { [oppositeName]: data2._id },
              },
            } as const;

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
              const _id = item.id || new mongooseTypes.ObjectId();
              ids.splice(positions[i], 0, _id);
              prepared.push({
                data: {
                  ...item,
                  _id,

                  [oppositeName]: oppositeArray ? [data2._id] : data2._id,
                },
                config,
              });
            });

            prev[key] = ids;
          } else {
            const _id = data2[key].create.id || new mongooseTypes.ObjectId();

            prepared.push({
              data: {
                ...data2[key].create,
                _id,

                [oppositeName]: oppositeArray ? [data2._id] : data2._id,
              },
              config: duplexFieldsObject[key].config,
            });

            prev[key] = _id;
          }
        }
        if (data2[key].connect === undefined && data2[key].create === undefined && data2[key]) {
          // set id of created entity

          prev[key] = data2[key];
        }
      } else if (embeddedFieldsObject[key]) {
        const { array, config } = embeddedFieldsObject[key];
        if (array) {
          prev[key] = data2[key].map((value) => transform(value, config));
        } else {
          prev[key] = data2[key] === null ? null : transform(data2[key], config);
        }
      } else if (filterFieldsObject[key]) {
        if (data2[key] === null) {
          prev[key] = null;
        } else {
          prev[key] = JSON.stringify(
            whereFromGlobalIds(data2[key], filterFieldsObject[key].config),
          );
        }
      } else if (geospatialFieldsObject[key]) {
        const { array, geospatialType } = geospatialFieldsObject[key];
        if (array) {
          if (geospatialType === 'Point') {
            prev[key] = data2[key].map((value) => pointFromGqlToMongo(value));
          } else if (geospatialType === 'Polygon') {
            prev[key] = data2[key].map((value) => polygonFromGqlToMongo(value));
          } else if (geospatialType === 'MultiPolygon') {
            prev[key] = data2[key].map((value) => multiPolygonFromGqlToMongo(value));
          }
        } else {
          if (geospatialType === 'Point') {
            prev[key] = pointFromGqlToMongo(data2[key]);
          } else if (geospatialType === 'Polygon') {
            prev[key] = polygonFromGqlToMongo(data2[key]);
          } else if (geospatialType === 'MultiPolygon') {
            prev[key] = multiPolygonFromGqlToMongo(data2[key]);
          }
        }
      } else if (scalarFieldsArray.includes(key)) {
        if (data2[key] !== null) {
          prev[key] = data2[key];
        }
      }
      return prev;
    }, {});
  };

  let first = true;
  while (prepared.length > 0) {
    const { data: data3, config } = prepared.shift();

    const document = transform(data3, config);

    let item = null;
    if (first) {
      mains.push(document);
      first = false;
      if (processingKind === 'update') {
        const { _id, $unset, ...$set } = document;
        const update: Record<string, any> = {};
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
        const { _id, ...rest } = document;

        item = processForPushEach(rest, rootFieldsPositions).map((update) => ({
          updateOne: {
            filter: { _id },
            update,
          },
        }));
      } else if (processingKind === 'updateMany') {
        const { _id, ...$set } = document;
        const arr = core.get(config);
        const filter = arr && getUpdateMany($set, arr);
        if (filter) {
          filter._id.$in.push(_id);
          continue;
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
