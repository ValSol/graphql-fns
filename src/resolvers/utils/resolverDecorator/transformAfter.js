// @flow

import type { EntityConfig, GeneralConfig } from '../../../flowTypes';

import parseEntityName from '../../../utils/parseEntityName';
import toGlobalId from '../toGlobalId';

const transformAfter = (
  item: Object,
  entityConfig: null | EntityConfig,
  generalConfig: null | GeneralConfig,
  isChild: boolean = false,
): Object => {
  if (!entityConfig) {
    return item;
  }

  if (!item) {
    return item;
  }

  if (typeof item !== 'object') {
    return item;
  }

  const {
    childFields,
    duplexFields,
    embeddedFields,
    fileFields,
    relationalFields,
    type: configType,
  } = entityConfig;

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
        const { root: rootName, derivativeKey } = parseEntityName(config.name, generalConfig);

        if (array) {
          prev[name] = item[name].map((item2) => toGlobalId(item2, rootName, derivativeKey)); // eslint-disable-line no-param-reassign
        } else {
          prev[name] = toGlobalId(item[name], rootName, derivativeKey); // eslint-disable-line no-param-reassign
        }
      }

      return prev;
    },
    {},
  );

  const recursiveFields = [
    ...(childFields || []),
    ...(embeddedFields || []),
    ...(fileFields || []),
  ].reduce((prev, { array, config, name }) => {
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
  }, {});

  const { id, ...rest } = item;

  let globalId;

  if (isChild && configType !== 'tangible') {
    globalId = id;
  } else if (generalConfig) {
    const { root: rootName, derivativeKey } = parseEntityName(entityConfig.name, generalConfig);

    globalId = toGlobalId(id, rootName, derivativeKey); // eslint-disable-line no-param-reassign
  } else {
    globalId = toGlobalId(id, entityConfig.name); // eslint-disable-line no-param-reassign
  }

  return {
    ...rest,
    ...recursiveFields,
    ...transformedFields,
    id: globalId,
  };
};

export default transformAfter;
