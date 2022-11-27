// @flow
import type { EntityConfig } from '../../../flowTypes';

type ProcessDeleteDataResult = Map<EntityConfig, Array<Object>>;

const processDeleteData = (
  data: Object,
  initialCore: null | Map<EntityConfig, Array<Object>>,
  entityConfig: EntityConfig,
  forDelete?: boolean,
): ProcessDeleteDataResult => {
  // eslint-disable-next-line no-unused-vars
  const { _id } = data;
  const { duplexFields } = entityConfig;

  const duplexFieldsArray = (duplexFields || []).reduce(
    (prev, { name, oppositeName, array, config }) => {
      if (!config.duplexFields) {
        // to prevent flowjs error
        throw new TypeError('Expected a duplexFields in config!');
      }
      const duplexField = config.duplexFields.find(({ name: name2 }) => name2 === oppositeName);
      if (!duplexField) {
        throw new TypeError(`Expected a duplexField with name "${oppositeName}"!`);
      }
      const { array: oppositeArray, config: oppositeConfig } = duplexField;
      prev.push({ array, config, name, oppositeArray, oppositeConfig, oppositeName });
      return prev;
    },
    [],
  );

  const core = initialCore || new Map();

  if (forDelete) {
    const item = { deleteOne: { filter: { _id } } };

    const resultItem = core.get(entityConfig);
    if (resultItem) {
      resultItem.push(item);
    } else {
      core.set(entityConfig, [item]);
    }
  }

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

          const resultItem = core.get(config);
          if (resultItem) {
            resultItem.push(item);
          } else {
            core.set(config, [item]);
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

        const resultItem = core.get(config);
        if (resultItem) {
          resultItem.push(item);
        } else {
          core.set(config, [item]);
        }
      }
    }
  });

  return core;
};

export default processDeleteData;
