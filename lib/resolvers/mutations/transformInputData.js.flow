// @flow
import type { ThingConfig } from '../../flowTypes';

type TransformInputDataResult = {
  core: { [ThingConfig]: Array<Object> },
  periphery: { [ThingConfig]: Array<Object> },
  single: Boolean,
  first: Object,
};

const { Types } = require('mongoose');

const transformInputData = (
  data: Object,
  thingConfig: ThingConfig,
  // use mongoose Types in args to let mocking the ObjectId() in tests
  mongooseTypes: Object = Types,
): Object => {
  const core = new Map();
  const periphery = new Map();
  const prepared = [{ data: { ...data, _id: mongooseTypes.ObjectId() }, config: thingConfig }];

  const transform = (data2: Object, thingConfig2: ThingConfig): TransformInputDataResult => {
    const { duplexFields, embeddedFields, relationalFields, textFields } = thingConfig2;

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

    const embeddedFieldsConfigs = {};
    if (embeddedFields) {
      embeddedFields.reduce((prev, { name, config }) => {
        // eslint-disable-next-line
        prev[name] = config;
        return prev;
      }, embeddedFieldsConfigs);
    }

    const scalarFieldsArray = ['_id'];
    if (textFields) {
      textFields.reduce((prev, { name }) => {
        prev.push(name);
        return prev;
      }, scalarFieldsArray);
    }

    return Object.keys(data2).reduce((prev, key) => {
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
            data2[key].create.forEach(item => {
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
        const { array, config, oppositeArray, oppositeName } = duplexFieldsObject[key];
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

            oppositeIds.forEach(oppositeId => {
              const item = {
                updateOne: {
                  filter: { _id: oppositeId },
                  update: oppositeArray
                    ? // eslint-disable-next-line no-underscore-dangle
                      { $push: { [oppositeName]: data2._id } }
                    : // TODO set remove id value for previous array
                      // eslint-disable-next-line no-underscore-dangle
                      { [oppositeName]: data2._id },
                },
              };
              if (core.get(config)) {
                // $FlowFixMe
                core.get(config).push(item);
              } else {
                core.set(config, [item]);
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
                  : // TODO set null for previous value
                    // eslint-disable-next-line no-underscore-dangle
                    { [oppositeName]: data2._id },
              },
            };
            if (core.get(config)) {
              // $FlowFixMe
              core.get(config).push(item);
            } else {
              core.set(config, [item]);
            }
          }
        }

        if (data2[key].create) {
          if (array) {
            const ids = data2[key].connect || [];
            data2[key].create.forEach(item => {
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
        if (!data2[key].connect && !data2[key].create && data2[key]) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key];
        }
      } else if (embeddedFieldsConfigs[key]) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = transform(data2[key], embeddedFieldsConfigs[key]);
      } else if (scalarFieldsArray.includes(key)) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data2[key];
      }
      return prev;
    }, {});
  };

  let first = null;
  while (prepared.length) {
    const { data: data3, config } = prepared.shift();

    const document = transform(data3, config);
    if (!first) first = document;
    const item = { insertOne: { document } };

    if (core.get(config)) {
      // $FlowFixMe
      core.get(config).push(item);
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

module.exports = transformInputData;
