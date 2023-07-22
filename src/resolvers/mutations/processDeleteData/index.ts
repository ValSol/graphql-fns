import type { DataObject, TangibleEntityConfig } from '../../../tsTypes';
import type { Core } from '../../tsTypes';

type ProcessDeleteDataResult = Map<TangibleEntityConfig, Array<DataObject>>;

const processDeleteData = (
  data: DataObject,
  initialCore: null | Map<TangibleEntityConfig, Array<DataObject>>,
  entityConfig: TangibleEntityConfig,
  forDelete?: boolean,
): ProcessDeleteDataResult => {
  const { _id } = data;
  const { duplexFields = [], relationalFields = [] } = entityConfig;

  const duplexFieldsArray = duplexFields.reduce((prev, { name, oppositeName, array, config }) => {
    const duplexField = config.duplexFields.find(({ name: name2 }) => name2 === oppositeName);
    if (!duplexField) {
      throw new TypeError(
        `Expected a duplexField with name "${oppositeName}" in "${config.name}" entity!`,
      );
    }

    const { array: oppositeArray } = duplexField;
    prev.push({ array, config, name, oppositeArray, oppositeName });

    return prev;
  }, []);

  const relationalFieldsArray = relationalFields
    .filter(({ parent }) => parent)
    .reduce((prev, { oppositeName, config }) => {
      const relationalField = config.relationalFields.find(
        ({ name: name2 }) => name2 === oppositeName,
      );
      if (!relationalField) {
        throw new TypeError(
          `Expected a relationalField with name "${oppositeName}" in "${config.name}" entity!`,
        );
      }

      const { array: oppositeArray } = relationalField;
      prev.push({ config, oppositeArray, oppositeName });

      return prev;
    }, []);

  const core: Core = initialCore || new Map();

  if (forDelete) {
    const item = { deleteOne: { filter: { _id } } } as const;

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
          } as const;

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
        } as const;

        const resultItem = core.get(config);
        if (resultItem) {
          resultItem.push(item);
        } else {
          core.set(config, [item]);
        }
      }
    }
  });

  relationalFieldsArray.forEach(({ config, oppositeArray, oppositeName }) => {
    const item = {
      updateMany: {
        filter: {
          [oppositeName]: _id,
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
    } as const;

    const resultItem = core.get(config);
    if (resultItem) {
      resultItem.push(item);
    } else {
      core.set(config, [item]);
    }
  });

  return core;
};

export default processDeleteData;
