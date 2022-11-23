// @flow

import type { ThingConfig, GeneralConfig } from '../../../flowTypes';

import parseThingName from '../parseThingName';
import toGlobalId from '../toGlobalId';

const transformAfter = (
  item: Object,
  thingConfig: null | ThingConfig,
  generalConfig: null | GeneralConfig,
  isChild: boolean = false,
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

  const {
    duplexFields,
    embeddedFields,
    fileFields,
    relationalFields,
    type: configType,
  } = thingConfig;

  const transformedFields = [...(duplexFields || []), ...(relationalFields || [])].reduce(
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

  const recursiveFields = [...(embeddedFields || []), ...(fileFields || [])].reduce(
    (prev, { array, config, name }) => {
      if (!item[name]) return prev;

      if (array) {
        // eslint-disable-next-line no-param-reassign
        prev[name] = item[name].map(
          (item2) => item2 && transformAfter(item2, config, generalConfig, true),
        );
      } else {
        prev[name] = transformAfter(item[name], config, generalConfig, true); // eslint-disable-line no-param-reassign
      }

      return prev;
    },
    {},
  );

  const { id, ...rest } = item;

  let globalId;

  if (isChild && configType !== 'tangible') {
    globalId = id;
  } else if (generalConfig) {
    const { root: rootName, suffix } = parseThingName(thingConfig.name, generalConfig);

    globalId = toGlobalId(id, rootName, suffix); // eslint-disable-line no-param-reassign
  } else {
    globalId = toGlobalId(id, thingConfig.name); // eslint-disable-line no-param-reassign
  }

  return {
    ...rest,
    ...recursiveFields,
    ...transformedFields,
    id: globalId,
  };
};

export default transformAfter;
