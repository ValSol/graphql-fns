// @flow
import type { ThingConfig } from '../../../flowTypes';

type ProcessDeleteDataResult = Map<ThingConfig, Array<Object>>;

const processDeleteData = (data: Object, thingConfig: ThingConfig): ProcessDeleteDataResult => {
  // eslint-disable-next-line no-unused-vars
  const { _id } = data;
  const { duplexFields } = thingConfig;

  const duplexFieldsArray = [];
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
      prev.push({ array, config, name, oppositeArray, oppositeConfig, oppositeName });
      return prev;
    }, duplexFieldsArray);
  }

  const result = new Map();

  duplexFieldsArray.forEach(({ name, array, config, oppositeArray, oppositeName }) => {
    if (data[name]) {
      if (array) {
        data[name].forEach((oppositeId) => {
          const item = {
            updateOne: {
              filter: {
                _id: oppositeId,
              },
              update: oppositeArray
                ? {
                    $pull: {
                      [oppositeName]: _id,
                    },
                  }
                : {
                    $unset: {
                      [oppositeName]: 1,
                    },
                  },
            },
          };
          const resultItem = result.get(config);
          if (resultItem) {
            resultItem.push(item);
          } else {
            result.set(config, [item]);
          }
        });
      } else {
        const oppositeId = data[name];
        const item = {
          updateOne: {
            filter: {
              _id: oppositeId,
            },
            update: oppositeArray
              ? {
                  $pull: {
                    [oppositeName]: _id,
                  },
                }
              : {
                  $unset: {
                    [oppositeName]: 1,
                  },
                },
          },
        };
        const resultItem = result.get(config);
        if (resultItem) {
          resultItem.push(item);
        } else {
          result.set(config, [item]);
        }
      }
    }
  });

  return result;
};

export default processDeleteData;
