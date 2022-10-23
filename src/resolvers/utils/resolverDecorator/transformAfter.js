// @flow

import type { ThingConfig, GeneralConfig } from '../../../flowTypes';

import parseThingName from '../parseThingName';
import toGlobalId from '../toGlobalId';

const transformAfter = (
  item: Object,
  thingConfig: null | ThingConfig,
  generalConfig: null | GeneralConfig,
): Object => {
  if (!thingConfig) {
    return item;
  }

  if (!item) {
    return item;
  }

  if (typeof item !== 'object') {
    return item;
  }

  const { relationalFields, duplexFields } = thingConfig;

  const transformedFields = [...(relationalFields || []), ...(duplexFields || [])].reduce(
    (prev, { array, config, name }) => {
      if (!item[name]) return prev;

      if (!generalConfig) {
        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, config.name)); // eslint-disable-line no-param-reassign
        } else {
          prev[name] = toGlobalId(item[name], config.name); // eslint-disable-line no-param-reassign
        }
      } else {
        const { root: rootName, suffix } = parseThingName(config.name, generalConfig);

        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, rootName, suffix)); // eslint-disable-line no-param-reassign
        } else {
          prev[name] = toGlobalId(item[name], rootName, suffix); // eslint-disable-line no-param-reassign
        }
      }

      return prev;
    },
    {},
  );

  const { id, ...rest } = item;

  let globaId;

  if (!generalConfig) {
    globaId = toGlobalId(id, thingConfig.name); // eslint-disable-line no-param-reassign
  } else {
    const { root: rootName, suffix } = parseThingName(thingConfig.name, generalConfig);

    globaId = toGlobalId(id, rootName, suffix); // eslint-disable-line no-param-reassign
  }

  return {
    ...rest,
    ...transformedFields,
    id: globaId,
  };
};

export default transformAfter;
