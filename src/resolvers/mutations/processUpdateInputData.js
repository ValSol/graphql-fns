// @flow
import type { Periphery, ThingConfig } from '../../flowTypes';

type Core = { [ThingConfig]: Array<Object> };

type ProcessUpdateInputDataResult = {
  core: Core,
  periphery: Periphery,
};

const processCreateInputData = (
  data: Object,
  thingConfig: ThingConfig,
  core: Core = new Map(),
): ProcessUpdateInputDataResult => {
  const { duplexFields } = thingConfig;
  const periphery = new Map();

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

  Object.keys(data).forEach(key => {
    if (duplexFieldsObject[key]) {
      const { array, config, oppositeArray, oppositeConfig, oppositeName } = duplexFieldsObject[
        key
      ];

      if (array) {
        const oppositeIds = data[key];

        oppositeIds.forEach(oppositeId => {
          const item = {
            updateOne: {
              filter: { _id: oppositeId },
              update: oppositeArray
                ? // eslint-disable-next-line no-underscore-dangle
                  { $push: { [oppositeName]: data._id } }
                : // eslint-disable-next-line no-underscore-dangle
                  { [oppositeName]: data._id },
            },
          };
          // $FlowFixMe
          if (core.get(config)) {
            // $FlowFixMe
            core.get(config).push(item);
          } else {
            // $FlowFixMe
            core.set(config, [item]);
          }
          if (!oppositeArray) {
            if (periphery.get(config)) {
              // $FlowFixMe
              if (periphery.get(config)[oppositeName]) {
                // $FlowFixMe
                periphery.get(config)[oppositeName].oppositeIds.push(oppositeId);
              } else {
                // $FlowFixMe
                periphery.get(config)[oppositeName] = {
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
        const oppositeId = data[key];

        const item = {
          updateOne: {
            filter: { _id: oppositeId },
            update: oppositeArray
              ? // eslint-disable-next-line no-underscore-dangle
                { $push: { [oppositeName]: data._id } }
              : // eslint-disable-next-line no-underscore-dangle
                { [oppositeName]: data._id },
          },
        };
        // $FlowFixMe
        if (core.get(config)) {
          // $FlowFixMe
          core.get(config).push(item);
        } else {
          // $FlowFixMe
          core.set(config, [item]);
        }

        if (!oppositeArray) {
          if (periphery.get(config)) {
            // $FlowFixMe
            if (periphery.get(config)[oppositeName]) {
              // $FlowFixMe
              periphery.get(config)[oppositeName].oppositeIds.push(oppositeId);
            } else {
              // $FlowFixMe
              periphery.get(config)[oppositeName] = {
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
  });

  return { core, periphery };
};

module.exports = processCreateInputData;
