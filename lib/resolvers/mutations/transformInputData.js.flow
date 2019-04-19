// @flow
import type { ThingConfig } from '../../flowTypes';

const { Types } = require('mongoose');

const transformInputData = (
  data: Object,
  thingConfig: ThingConfig,
  // use mongoose Types in args to let mocking the ObjectId() in tests
  mongooseTypes: Object = Types,
): Object => {
  const results = [];
  const prepared = [{ data: { ...data, _id: mongooseTypes.ObjectId() }, config: thingConfig }];

  const transform = (data2: Object, thingConfig2: ThingConfig): Object => {
    const { duplexFields, embeddedFields, relationalFields } = thingConfig2;

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
        const { array: oppositeArray } = duplexField;
        // eslint-disable-next-line
        prev[name] = { array, config, oppositeName, oppositeArray };
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

    return Object.keys(data2).reduce((prev, key) => {
      if (relationalFieldsObject[key]) {
        if (data2[key].connect) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key].connect;
        }
        if (data2[key].create) {
          if (relationalFieldsObject[key].array) {
            const ids = data2[key].connect || [];
            data2[key].create.forEach(item => {
              // eslint-disable-next-line no-underscore-dangle
              const _id = mongooseTypes.ObjectId();
              ids.push(_id);
              prepared.push({
                data: { ...item, _id },
                config: relationalFieldsObject[key].config,
              });
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = ids;
          } else {
            // eslint-disable-next-line no-underscore-dangle
            const _id = mongooseTypes.ObjectId();

            prepared.push({
              data: { ...data2[key].create, _id },
              config: relationalFieldsObject[key].config,
            });
            // eslint-disable-next-line no-param-reassign
            prev[key] = _id;
          }
        }
      } else if (duplexFieldsObject[key]) {
        const { array, config, oppositeArray, oppositeName } = duplexFieldsObject[key];
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
        } else if (data2[key]) {
          // eslint-disable-next-line no-param-reassign
          prev[key] = data2[key];
        }
      } else if (embeddedFieldsConfigs[key]) {
        // eslint-disable-next-line no-param-reassign
        prev[key] = transform(data2[key], embeddedFieldsConfigs[key]);
      } else {
        // eslint-disable-next-line no-param-reassign
        prev[key] = data2[key];
      }
      return prev;
    }, {});
  };

  while (prepared.length) {
    const { data: data3, config } = prepared.shift();

    results.push({ config, data: transform(data3, config) });
  }

  return results;
};

module.exports = transformInputData;
